import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Order, Product } from '@/lib/models';
import { normalizeProduct } from '@/lib/productVariants';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

function createInvoiceNumber(orderId) {
  const digits = String(orderId).replace(/\D/g, '').slice(-6).padStart(6, '0');
  return `INV-${new Date().getFullYear()}-${digits}`;
}

function findMongoProduct(productId) {
  const query = mongoose.Types.ObjectId.isValid(productId)
    ? { _id: productId }
    : { $or: [{ id: productId }, { 'metadata.sourceId': productId }] };

  return Product.findOne(query);
}

function combineOrderItems(items) {
  const combined = new Map();
  for (const item of items) {
    const packSize = String(item.packSize || item.unit || '').trim();
    const key = `${item.id}::${packSize}`;
    const current = combined.get(key);
    combined.set(key, current
      ? { ...current, quantity: current.quantity + Number(item.quantity || 0) }
      : { ...item, packSize, unit: packSize, quantity: Number(item.quantity || 0) });
  }
  return [...combined.values()];
}

// Helper to verify auth token
function verifyUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function GET(req) {
  try {
    const userPayload = verifyUser(req);
    if (!userPayload) {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    try {
      await connectDB();
      if (userPayload.role === 'admin') {
        const orders = await Order.find({}).lean();
        return NextResponse.json({ orders });
      } else {
        const userOrders = await Order.find({ userId: userPayload.id }).lean();
        return NextResponse.json({ orders: userOrders });
      }
    } catch (e) {
      const orders = db.getOrders();
      if (userPayload.role === 'admin') {
        return NextResponse.json({ orders });
      } else {
        const userOrders = orders.filter(o => o.userId === userPayload.id);
        return NextResponse.json({ orders: userOrders });
      }
    }
  } catch (error) {
    console.error('API Orders Get Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userPayload = verifyUser(req);
    if (!userPayload) {
      return NextResponse.json({ message: 'Unauthorized. Login to place order.' }, { status: 401 });
    }

    const { items, subtotal, discountAmount = 0, shippingFee = 0, total, shippingAddress, paymentMethod, transferId } = await req.json();
    const orderItems = Array.isArray(items) ? combineOrderItems(items) : [];
    const normalizedTransferId = typeof transferId === 'string' ? transferId.trim() : '';

    if (!normalizedTransferId) {
      return NextResponse.json({ message: 'Transfer ID / UTR Number is required' }, { status: 400 });
    }

    if (!orderItems.length || orderItems.some((item) => !item.packSize || item.quantity <= 0) || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ message: 'Missing required order details' }, { status: 400 });
    }

    try {
      const conn = await connectDB();
      
      // If MongoDB is configured but connection failed
      if (process.env.MONGODB_URI && !conn) {
        console.error('❌ MongoDB configured but unable to connect for order creation');
        return NextResponse.json(
          { message: 'Database connection failed. Please try again.' },
          { status: 503 }
        );
      }
      
      // If MongoDB is available, use it
      if (conn) {
        console.log('📝 Creating order in MongoDB...');
        
        // Verify stock availability
        const mongoProducts = [];
        const verifiedItems = [];
        for (const item of orderItems) {
          const product = await findMongoProduct(item.id);
          if (!product) {
            console.warn(`Product ${item.id} is not in MongoDB; using JSON storage for this order`);
            mongoProducts.length = 0;
            break;
          }
          const normalizedProduct = normalizeProduct(product.toObject());
          const variant = normalizedProduct.variants.find((entry) => entry.packSize === item.packSize);
          if (!variant) return NextResponse.json({ message: `Pack size ${item.packSize} is not available for ${item.name}.` }, { status: 400 });
          if (userPayload.role === 'wholesale' && variant.wholesalePrice != null && item.quantity < variant.wholesaleMinimumQuantity) {
            return NextResponse.json({ message: `Minimum order for ${item.name} (${item.packSize}) is ${variant.wholesaleMinimumQuantity} units.` }, { status: 400 });
          }
          if (variant.stock < item.quantity) return NextResponse.json({ message: `Insufficient stock for ${item.name} (${item.packSize}). Available: ${variant.stock}` }, { status: 400 });
          mongoProducts.push({ item, product, variant });
          const isWholesale = userPayload.role === 'wholesale' && variant.wholesalePrice != null;
          verifiedItems.push({ ...item, price: isWholesale ? variant.wholesalePrice : variant.price, wholesalePrice: variant.wholesalePrice, wholesaleMinimumQuantity: variant.wholesaleMinimumQuantity, stock: variant.stock });
        }

        if (mongoProducts.length === orderItems.length) {
          // Deduct stock
          for (const { item, product } of mongoProducts) {
            const productData = product.toObject();
            if (Array.isArray(productData.variants) && productData.variants.length) {
              const update = { $inc: { 'variants.$[variant].stock': -item.quantity } };
              if (productData.packSize === item.packSize) update.$inc.stock = -item.quantity;
              await Product.findByIdAndUpdate(product._id, update, { arrayFilters: [{ 'variant.packSize': item.packSize }] });
            } else {
              await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
            }
          }

          const orderId = 'ord_' + Math.floor(100000 + Math.random() * 900000);
          const verifiedTotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const created = await Order.create({ orderId, userId: userPayload.id, userEmail: userPayload.email, items: verifiedItems, subtotal: verifiedTotal, discountAmount, shippingFee, total: verifiedTotal - discountAmount + shippingFee, invoiceNumber: createInvoiceNumber(orderId), shippingAddress, paymentMethod: 'GPay', transferId: normalizedTransferId, status: 'pending', paymentStatus: 'verification_pending' });
          console.log('✅ Order created successfully in MongoDB');
          return NextResponse.json({ success: true, order: created });
        }
      }
    } catch (mongoError) {
      console.error('❌ MongoDB write error:', mongoError.message);
      // Only fall back to JSON if MongoDB is NOT configured
      if (!process.env.MONGODB_URI) {
        console.log('📁 Falling back to JSON storage');
      } else {
        // MongoDB was configured but failed - this is an error
        return NextResponse.json(
          { message: 'Database write failed: ' + mongoError.message },
          { status: 500 }
        );
      }
    }

    // Use JSON storage only if MongoDB is not configured
    console.log('📁 Using JSON file storage for order');
    const products = db.getProducts();

    // Verify stock availability and deduct
    const verifiedItems = [];
    for (const item of orderItems) {
      const product = products.find(p => p.id === item.id);
      if (!product) {
        return NextResponse.json({ message: `Product ${item.name} not found.` }, { status: 400 });
      }
      const normalizedProduct = normalizeProduct(product);
      const variant = normalizedProduct.variants.find((entry) => entry.packSize === item.packSize);
      if (!variant) return NextResponse.json({ message: `Pack size ${item.packSize} is not available for ${item.name}.` }, { status: 400 });
      if (userPayload.role === 'wholesale' && variant.wholesalePrice != null && item.quantity < variant.wholesaleMinimumQuantity) {
        return NextResponse.json({ message: `Minimum order for ${item.name} (${item.packSize}) is ${variant.wholesaleMinimumQuantity} units.` }, { status: 400 });
      }
      if (variant.stock < item.quantity) return NextResponse.json({ message: `Insufficient stock for ${item.name} (${item.packSize}). Available: ${variant.stock}` }, { status: 400 });
      const isWholesale = userPayload.role === 'wholesale' && variant.wholesalePrice != null;
      verifiedItems.push({ ...item, price: isWholesale ? variant.wholesalePrice : variant.price, wholesalePrice: variant.wholesalePrice, wholesaleMinimumQuantity: variant.wholesaleMinimumQuantity, stock: variant.stock });
    }

    const updatedProducts = products.map(p => {
      const productItems = orderItems.filter((item) => item.id === p.id);
      if (!productItems.length) return p;
      const normalizedProduct = normalizeProduct(p);
      const variants = normalizedProduct.variants.map((variant) => {
        const item = productItems.find((entry) => entry.packSize === variant.packSize);
        return item ? { ...variant, stock: variant.stock - item.quantity } : variant;
      });
      const selectedVariant = variants.find((variant) => variant.packSize === (p.packSize || p.unit)) || variants[0];
      return { ...p, variants, packSize: selectedVariant?.packSize, unit: selectedVariant?.packSize, price: selectedVariant?.price, stock: selectedVariant?.stock };
    });
    db.saveProducts(updatedProducts);

    const orders = db.getOrders();
    const id = 'ord_' + Math.floor(100000 + Math.random() * 900000);
    const verifiedTotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = {
      id,
      userId: userPayload.id,
      userEmail: userPayload.email,
      items: verifiedItems,
      subtotal: verifiedTotal,
      discountAmount,
      shippingFee,
      total: verifiedTotal - discountAmount + shippingFee,
      invoiceNumber: createInvoiceNumber(id),
      shippingAddress,
      paymentMethod: 'GPay',
      transferId: normalizedTransferId,
      status: 'pending',
      paymentStatus: 'verification_pending',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    db.saveOrders(orders);
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('API Order Placement Error:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}

// Update order status (Admin operation)
export async function PUT(req) {
  try {
    const userPayload = verifyUser(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { orderId, status, paymentStatus, action, rejectionReason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: 'Missing order ID' }, { status: 400 });
    }

    if (action === 'verify_payment' && !['verification_pending', 'pending'].includes(paymentStatus || 'verification_pending')) {
      return NextResponse.json({ message: 'Payment cannot be verified from its current status' }, { status: 409 });
    }
    if (action === 'reject_payment' && !String(rejectionReason || '').trim()) {
      return NextResponse.json({ message: 'A rejection reason is required' }, { status: 400 });
    }

    let conn = null;
    try {
      conn = await connectDB();
    } catch (error) {
      console.error('Order update database connection failed:', error.message);
    }

    if (conn) {
      const mongoOrder = await Order.findOne({ orderId });
      if (mongoOrder) {
        const changes = {};
        if (action === 'verify_payment' || action === 'reject_payment') {
          if (mongoOrder.paymentStatus !== 'verification_pending') {
            return NextResponse.json({ message: 'Payment is no longer awaiting verification' }, { status: 409 });
          }
          if (action === 'verify_payment') {
            changes.paymentStatus = 'paid';
            changes.status = 'confirmed';
            changes.verifiedAt = new Date();
            changes.verifiedBy = String(userPayload.id || userPayload.email || '');
            changes.verifiedByEmail = String(userPayload.email || '');
            changes.rejectionReason = '';
          } else {
            changes.paymentStatus = 'rejected';
            changes.rejectionReason = String(rejectionReason).trim();
          }
        } else {
          if (status) changes.status = status;
          if (paymentStatus) changes.paymentStatus = paymentStatus;
        }
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: mongoOrder._id },
          { $set: changes },
          { new: true, runValidators: false }
        ).lean();
        return NextResponse.json({ success: true, order: updatedOrder });
      }
      if (process.env.MONGODB_URI && !db.getOrders().some(o => (o.id || o.orderId) === orderId)) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
      }
    } else if (process.env.MONGODB_URI) {
      return NextResponse.json({ message: 'Database connection failed. Please try again.' }, { status: 503 });
    }

    const orders = db.getOrders();
    const orderIndex = orders.findIndex(o => (o.id || o.orderId) === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (action === 'verify_payment' || action === 'reject_payment') {
      if (orders[orderIndex].paymentStatus !== 'verification_pending') {
        return NextResponse.json({ message: 'Payment is no longer awaiting verification' }, { status: 409 });
      }
      if (action === 'verify_payment') {
        orders[orderIndex].paymentStatus = 'paid';
        orders[orderIndex].status = 'confirmed';
        orders[orderIndex].verifiedAt = new Date().toISOString();
        orders[orderIndex].verifiedBy = String(userPayload.id || userPayload.email || '');
        orders[orderIndex].verifiedByEmail = String(userPayload.email || '');
        orders[orderIndex].rejectionReason = '';
      } else {
        orders[orderIndex].paymentStatus = 'rejected';
        orders[orderIndex].rejectionReason = String(rejectionReason).trim();
      }
    } else {
      if (status) orders[orderIndex].status = status;
      if (paymentStatus) orders[orderIndex].paymentStatus = paymentStatus;
    }

    db.saveOrders(orders);
    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.error('API Order Update Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
