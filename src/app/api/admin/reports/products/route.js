import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { db } from '@/lib/db';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

function verifyAdmin(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.role === 'admin' ? decoded : null;
  } catch (err) {
    return null;
  }
}

function getDateRange(fromDate, toDate) {
  let from, to;

  if (fromDate && toDate) {
    from = startOfDay(parseISO(fromDate));
    to = endOfDay(parseISO(toDate));
  } else {
    const now = new Date();
    from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    to = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  }

  return { from, to };
}

export async function GET(req) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const reportType = searchParams.get('type') || 'products';

    const dateRange = getDateRange(fromDate, toDate);

    try {
      await connectDB();

      const dateMatch = {
        createdAt: {
          $gte: dateRange.from,
          $lte: dateRange.to
        }
      };

      const orders = await Order.find(dateMatch).lean();

      if (reportType === 'products') {
        // Product sales report
        const productSales = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            if (!productSales[item.id]) {
              productSales[item.id] = {
                id: item.id,
                name: item.name,
                categoryId: item.categoryId,
                quantity: 0,
                orders: 0,
                revenue: 0
              };
            }
            productSales[item.id].quantity += item.quantity;
            productSales[item.id].orders += 1;
            productSales[item.id].revenue += item.price * item.quantity;
          });
        });

        const productList = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue);

        return NextResponse.json({
          products: productList,
          totalProductTypes: productList.length,
          totalQuantity: productList.reduce((sum, p) => sum + p.quantity, 0),
          totalRevenue: Math.round(productList.reduce((sum, p) => sum + p.revenue, 0) * 100) / 100,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      } else if (reportType === 'categories') {
        // Category sales report
        const categorySales = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            if (!categorySales[item.categoryId]) {
              categorySales[item.categoryId] = {
                categoryId: item.categoryId,
                quantity: 0,
                orders: 0,
                revenue: 0
              };
            }
            categorySales[item.categoryId].quantity += item.quantity;
            categorySales[item.categoryId].orders += 1;
            categorySales[item.categoryId].revenue += item.price * item.quantity;
          });
        });

        const categoryList = Object.values(categorySales)
          .sort((a, b) => b.revenue - a.revenue);

        return NextResponse.json({
          categories: categoryList,
          totalCategories: categoryList.length,
          totalQuantity: categoryList.reduce((sum, c) => sum + c.quantity, 0),
          totalRevenue: Math.round(categoryList.reduce((sum, c) => sum + c.revenue, 0) * 100) / 100,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      }

      return NextResponse.json({ message: 'Invalid report type' }, { status: 400 });

    } catch (mongoError) {
      console.error('MongoDB error:', mongoError);
      
      // Fallback to JSON storage
      const orders = db.getOrders().filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dateRange.from && orderDate <= dateRange.to;
      });

      if (reportType === 'products') {
        const productSales = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            if (!productSales[item.id]) {
              productSales[item.id] = {
                id: item.id,
                name: item.name,
                categoryId: item.categoryId,
                quantity: 0,
                orders: 0,
                revenue: 0
              };
            }
            productSales[item.id].quantity += item.quantity;
            productSales[item.id].orders += 1;
            productSales[item.id].revenue += item.price * item.quantity;
          });
        });

        const productList = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue);

        return NextResponse.json({
          products: productList,
          totalProductTypes: productList.length,
          totalQuantity: productList.reduce((sum, p) => sum + p.quantity, 0),
          totalRevenue: Math.round(productList.reduce((sum, p) => sum + p.revenue, 0) * 100) / 100,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      } else if (reportType === 'categories') {
        const categorySales = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            if (!categorySales[item.categoryId]) {
              categorySales[item.categoryId] = {
                categoryId: item.categoryId,
                quantity: 0,
                orders: 0,
                revenue: 0
              };
            }
            categorySales[item.categoryId].quantity += item.quantity;
            categorySales[item.categoryId].orders += 1;
            categorySales[item.categoryId].revenue += item.price * item.quantity;
          });
        });

        const categoryList = Object.values(categorySales)
          .sort((a, b) => b.revenue - a.revenue);

        return NextResponse.json({
          categories: categoryList,
          totalCategories: categoryList.length,
          totalQuantity: categoryList.reduce((sum, c) => sum + c.quantity, 0),
          totalRevenue: Math.round(categoryList.reduce((sum, c) => sum + c.revenue, 0) * 100) / 100,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      }

      return NextResponse.json({ message: 'Invalid report type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Products/Categories Report API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
