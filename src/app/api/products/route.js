import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Product, Category } from '@/lib/models';
import { db } from '@/lib/db';
import { categoryPackSizes, normalizeProduct, productForVariant } from '@/lib/productVariants';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Helper to verify admin token
function verifyAdmin(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.role === 'admin' ? decoded : false;
  } catch (err) {
    return false;
  }
}

function productQuery(productId) {
  return mongoose.Types.ObjectId.isValid(productId)
    ? { _id: productId }
    : { $or: [{ id: productId }, { 'metadata.sourceId': productId }] };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Try MongoDB first; fall back to file-based data when Mongo is unavailable or empty
    let products = [];
    let categories = [];
    try {
      await connectDB();
      products = await Product.find({}).lean();
      categories = await Category.find({}).lean();

      // If MongoDB is empty, fall back to the local JSON seed data so the UI still renders.
      if ((!products || products.length === 0) || (!categories || categories.length === 0)) {
        throw new Error('MongoDB catalog is empty');
      }

      // normalize id fields for compatibility with frontend
      products = products.map(p => normalizeProduct({ ...p, id: p.id || p._id?.toString() }));
      categories = categories.map(c => ({ ...c, id: c.id || c._id?.toString() }));
    } catch (e) {
      products = db.getProducts();
      categories = db.getCategories();
      products = products.map(p => normalizeProduct({ ...p, id: p.id || p._id?.toString() }));
      categories = categories.map(c => ({ ...c, id: c.id || c._id?.toString() }));
    }

    // 1. Fetch single product details with related recommendations
    if (id) {
      const product = products.find(p => (p.id || p._id) == id);
      if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }

      // Related products (same category, excluding current product, limit to 4)
      const related = products
        .filter(p => p.categoryId === product.categoryId && p.id !== id)
        .slice(0, 4);

      return NextResponse.json({ product, related });
    }

    // 2. Fetch all products + categories for building the catalog search page
    if (type === 'catalog') {
      const prices = products.map(p => p.price);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 10000;
      return NextResponse.json({ products, categories, categoryPackSizes, minPrice, maxPrice });
    }

    // 3. Catalog filtration & sorting api
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const category = searchParams.get('category') || '';
    const selectedPackSizes = new Set((searchParams.get('packSize') || '').split(',').filter(Boolean));
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || Infinity;
    const availability = searchParams.get('availability') || 'all'; // 'all' or 'instock'
    const sort = searchParams.get('sort') || 'default'; // 'low-high', 'high-low', 'rating', 'latest'

    let filtered = products.flatMap((rawProduct) => {
      const product = normalizeProduct(rawProduct);
      if (category && product.categoryId !== category) return [];

      const searchTerms = search.split(/\s+/).filter(Boolean);
      return product.variants
        .filter((variant) => selectedPackSizes.size === 0 || selectedPackSizes.has(variant.packSize))
        .filter((variant) => {
          const searchableText = `${product.name} ${product.description || ''} ${variant.packSize}`.toLowerCase();
          return searchTerms.every((term) => searchableText.includes(term));
        })
        .filter((variant) => variant.price >= minPrice && variant.price <= maxPrice)
        .filter((variant) => availability !== 'instock' || variant.stock > 0)
        .map((variant) => productForVariant(product, variant.packSize));
    });

    // Sorting
    if (sort === 'low-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'high-low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'latest') {
      // Simulate latest by index or ID
      filtered.reverse();
    }

    return NextResponse.json({ products: filtered });
  } catch (error) {
    console.error('API Products Get Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, unit, stock, categoryId, images, specs, benefits, usage } = body;
    const variants = Array.isArray(body.variants) && body.variants.length
      ? body.variants.map((variant) => ({
          packSize: String(variant.packSize || '').trim(),
          price: Number(variant.price),
          stock: Number(variant.stock),
          wholesalePrice: variant.wholesalePrice === '' || variant.wholesalePrice == null ? null : Number(variant.wholesalePrice),
          wholesaleMinimumQuantity: Math.max(1, Number(variant.wholesaleMinimumQuantity) || 1)
        }))
      : [{ packSize: String(body.packSize || unit || '').trim(), price: Number(price), stock: Number(stock) || 0, wholesalePrice: null }];
    const primaryVariant = variants[0];

    if (!name || !primaryVariant.packSize || !Number.isFinite(primaryVariant.price) || !categoryId || !images || !images.length || variants.some((variant) => !variant.packSize || !Number.isFinite(variant.price) || !Number.isFinite(variant.stock) || variant.price < 0 || variant.stock < 0 || (variant.wholesalePrice != null && (!Number.isFinite(variant.wholesalePrice) || variant.wholesalePrice < 0)))) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
      const conn = await connectDB();
      
      // If MongoDB is configured but connection failed
      if (process.env.MONGODB_URI && !conn) {
        console.error('❌ MongoDB configured but unable to connect for product creation');
        return NextResponse.json(
          { message: 'Database connection failed. Please try again.' },
          { status: 503 }
        );
      }
      
      // If MongoDB is available, use it
      if (conn) {
        console.log('📝 Creating product in MongoDB...');
        const created = await Product.create({
          id: 'prod_' + Date.now(),
          name,
          description: description || '',
          price: primaryVariant.price,
          unit: primaryVariant.packSize,
          packSize: primaryVariant.packSize,
          stock: primaryVariant.stock,
          variants,
          rating: 5.0,
          numReviews: 0,
          categoryId,
          images,
          specs: specs || {},
          benefits: benefits || [],
          usage: usage || []
        });
        const prod = created.toObject();
        console.log('✅ Product created successfully in MongoDB');
        return NextResponse.json({ success: true, product: prod });
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
    console.log('📁 Using JSON file storage for product');
    const productsFile = db.getProducts();
    const newProduct = {
      id: 'prod_' + Date.now(),
      name,
      description: description || '',
      price: primaryVariant.price,
      unit: primaryVariant.packSize,
      packSize: primaryVariant.packSize,
      stock: primaryVariant.stock,
      variants,
      rating: 5.0,
      numReviews: 0,
      categoryId,
      images,
      specs: specs || {},
      benefits: benefits || [],
      usage: usage || []
    };
    productsFile.push(newProduct);
    db.saveProducts(productsFile);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('API Product Create Error:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, description, price, unit, stock, categoryId, images, specs, benefits, usage } = body;
    const variants = Array.isArray(body.variants) && body.variants.length
      ? body.variants.map((variant) => ({
          packSize: String(variant.packSize || '').trim(),
          price: Number(variant.price),
          stock: Number(variant.stock),
          wholesalePrice: variant.wholesalePrice === '' || variant.wholesalePrice == null ? null : Number(variant.wholesalePrice),
          wholesaleMinimumQuantity: Math.max(1, Number(variant.wholesaleMinimumQuantity) || 1)
        }))
      : undefined;
    if (variants?.some((variant) => !variant.packSize || !Number.isFinite(variant.price) || !Number.isFinite(variant.stock) || variant.price < 0 || variant.stock < 0 || (variant.wholesalePrice != null && (!Number.isFinite(variant.wholesalePrice) || variant.wholesalePrice < 0)))) {
      return NextResponse.json({ message: 'Invalid pack size, price, or stock in variants' }, { status: 400 });
    }
    const primaryVariant = variants?.[0];

    if (!id) {
      return NextResponse.json({ message: 'Missing product ID' }, { status: 400 });
    }

    const conn = await connectDB();
    if (conn) {
      const product = await Product.findOne(productQuery(id));
      if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }

      product.name = name || product.name;
      product.description = description !== undefined ? description : product.description;
      product.price = primaryVariant?.price ?? (price !== undefined ? parseFloat(price) : product.price);
      product.unit = primaryVariant?.packSize || unit || product.unit;
      product.packSize = primaryVariant?.packSize || product.packSize;
      product.stock = primaryVariant?.stock ?? (stock !== undefined ? parseInt(stock) : product.stock);
      if (variants) product.variants = variants;
      product.categoryId = categoryId || product.categoryId;
      product.images = images || product.images;
      product.specs = specs || product.specs;
      product.benefits = benefits || product.benefits;
      product.usage = usage || product.usage;

      const updated = await product.save();
      return NextResponse.json({ success: true, product: updated.toObject() });
    }

    const products = db.getProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Update fields
    products[index] = {
      ...products[index],
      name: name || products[index].name,
      description: description || products[index].description,
      price: primaryVariant?.price ?? (price !== undefined ? parseFloat(price) : products[index].price),
      unit: primaryVariant?.packSize || unit || products[index].unit,
      packSize: primaryVariant?.packSize || products[index].packSize || unit || products[index].unit,
      stock: primaryVariant?.stock ?? (stock !== undefined ? parseInt(stock) : products[index].stock),
      ...(variants ? { variants } : {}),
      categoryId: categoryId || products[index].categoryId,
      images: images || products[index].images,
      specs: specs || products[index].specs,
      benefits: benefits || products[index].benefits,
      usage: usage || products[index].usage
    };

    db.saveProducts(products);
    return NextResponse.json({ success: true, product: products[index] });
  } catch (error) {
    console.error('API Product Update Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing product ID' }, { status: 400 });
    }

    const conn = await connectDB();
    if (conn) {
      const deleted = await Product.findOneAndDelete(productQuery(id));
      if (!deleted) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    }

    const products = db.getProducts();
    const filtered = products.filter(p => p.id !== id);

    if (products.length === filtered.length) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    db.saveProducts(filtered);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('API Product Delete Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
