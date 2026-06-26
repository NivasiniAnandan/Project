import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

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

    const orders = db.getOrders();

    if (userPayload.role === 'admin') {
      // Admin gets all orders
      return NextResponse.json({ orders });
    } else {
      // User gets only their orders
      const userOrders = orders.filter(o => o.userId === userPayload.id);
      return NextResponse.json({ orders: userOrders });
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

    const { items, subtotal, total, shippingAddress, paymentMethod } = await req.json();

    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ message: 'Missing required order details' }, { status: 400 });
    }

    const products = db.getProducts();

    // Verify stock availability and deduct
    for (const item of items) {
      const product = products.find(p => p.id === item.id);
      if (!product) {
        return NextResponse.json({ message: `Product ${item.name} not found.` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Insufficient stock for ${item.name}. Available: ${product.stock}` }, { status: 400 });
      }
    }

    // Deduct stock
    const updatedProducts = products.map(p => {
      const orderItem = items.find(item => item.id === p.id);
      if (orderItem) {
        return { ...p, stock: p.stock - orderItem.quantity };
      }
      return p;
    });
    db.saveProducts(updatedProducts);

    // Save order
    const orders = db.getOrders();
    const newOrder = {
      id: 'ord_' + Math.floor(100000 + Math.random() * 900000), // 6 digit unique id
      userId: userPayload.id,
      userEmail: userPayload.email,
      items,
      subtotal,
      total,
      shippingAddress,
      paymentMethod, // 'credit-card' or 'invoice' (bank transfer)
      status: 'pending', // pending, processing, shipped, delivered, cancelled
      paymentStatus: paymentMethod === 'invoice' ? 'invoice_sent' : 'paid',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder); // Add to beginning of list
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

    const { orderId, status, paymentStatus } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: 'Missing order ID' }, { status: 400 });
    }

    const orders = db.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Update
    if (status) orders[orderIndex].status = status;
    if (paymentStatus) orders[orderIndex].paymentStatus = paymentStatus;

    db.saveOrders(orders);
    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.error('API Order Update Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
