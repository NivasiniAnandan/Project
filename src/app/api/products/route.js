import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const products = db.getProducts();
    const categories = db.getCategories();

    // 1. Fetch single product details with related recommendations
    if (id) {
      const product = products.find(p => p.id === id);
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
      return NextResponse.json({ products, categories, minPrice, maxPrice });
    }

    // 3. Catalog filtration & sorting api
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || Infinity;
    const availability = searchParams.get('availability') || 'all'; // 'all' or 'instock'
    const sort = searchParams.get('sort') || 'default'; // 'low-high', 'high-low', 'rating', 'latest'

    let filtered = products.filter(p => {
      // Search matching name or description
      const matchesSearch = p.name.toLowerCase().includes(search) || 
                            p.description.toLowerCase().includes(search);
      // Category filter
      const matchesCategory = category ? p.categoryId === category : true;
      // Price filter
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      // Availability filter
      const matchesAvailability = availability === 'instock' ? p.stock > 0 : true;

      return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
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

    if (!name || !price || !unit || !categoryId || !images || !images.length) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const products = db.getProducts();
    const newProduct = {
      id: 'prod_' + Date.now(),
      name,
      description: description || '',
      price: parseFloat(price),
      unit,
      stock: parseInt(stock) || 0,
      rating: 5.0, // initial default rating
      numReviews: 0,
      categoryId,
      images,
      specs: specs || {},
      benefits: benefits || [],
      usage: usage || []
    };

    products.push(newProduct);
    db.saveProducts(products);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('API Product Create Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ message: 'Missing product ID' }, { status: 400 });
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
      price: price !== undefined ? parseFloat(price) : products[index].price,
      unit: unit || products[index].unit,
      stock: stock !== undefined ? parseInt(stock) : products[index].stock,
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
