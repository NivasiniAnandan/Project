import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Order, Product } from '@/lib/models';
import { db } from '@/lib/db';
import { parseISO, startOfDay, endOfDay, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

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

function calculateSalesMetrics(orders) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalProductsSold = orders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProductsSold,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100
  };
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

      // Basic metrics
      const metrics = calculateSalesMetrics(orders);

      // Daily sales
      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const dailySales = days.map(day => {
        const dayOrders = orders.filter(o => {
          const oDate = new Date(o.createdAt);
          return oDate >= startOfDay(day) && oDate <= endOfDay(day);
        });
        return {
          date: format(day, 'yyyy-MM-dd'),
          displayDate: format(day, 'dd MMM'),
          sales: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders: dayOrders.length,
          products: dayOrders.reduce((sum, o) => {
            return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
          }, 0)
        };
      });

      // Product sales
      const productSales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              id: item.id,
              name: item.name,
              category: item.categoryId,
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

      const productSalesList = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue);

      // Category sales
      const categorySales = {};
      productSalesList.forEach(p => {
        if (!categorySales[p.category]) {
          categorySales[p.category] = {
            category: p.category,
            quantity: 0,
            orders: 0,
            revenue: 0
          };
        }
        categorySales[p.category].quantity += p.quantity;
        categorySales[p.category].orders += p.orders;
        categorySales[p.category].revenue += p.revenue;
      });

      const categorySalesList = Object.values(categorySales)
        .sort((a, b) => b.revenue - a.revenue);

      return NextResponse.json({
        metrics,
        dailySales: dailySales.filter(d => d.sales > 0 || d.orders > 0),
        productSales: productSalesList,
        categorySales: categorySalesList,
        dateRange: { from: dateRange.from, to: dateRange.to }
      });

    } catch (mongoError) {
      console.error('MongoDB error:', mongoError);
      
      // Fallback to JSON storage
      const orders = db.getOrders().filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dateRange.from && orderDate <= dateRange.to;
      });

      const metrics = calculateSalesMetrics(orders);

      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const dailySales = days.map(day => {
        const dayOrders = orders.filter(o => {
          const oDate = new Date(o.createdAt);
          return oDate >= startOfDay(day) && oDate <= endOfDay(day);
        });
        return {
          date: format(day, 'yyyy-MM-dd'),
          displayDate: format(day, 'dd MMM'),
          sales: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders: dayOrders.length,
          products: dayOrders.reduce((sum, o) => {
            return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
          }, 0)
        };
      });

      const productSales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              id: item.id,
              name: item.name,
              category: item.categoryId,
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

      const productSalesList = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue);

      const categorySales = {};
      productSalesList.forEach(p => {
        if (!categorySales[p.category]) {
          categorySales[p.category] = {
            category: p.category,
            quantity: 0,
            orders: 0,
            revenue: 0
          };
        }
        categorySales[p.category].quantity += p.quantity;
        categorySales[p.category].orders += p.orders;
        categorySales[p.category].revenue += p.revenue;
      });

      const categorySalesList = Object.values(categorySales)
        .sort((a, b) => b.revenue - a.revenue);

      return NextResponse.json({
        metrics,
        dailySales: dailySales.filter(d => d.sales > 0 || d.orders > 0),
        productSales: productSalesList,
        categorySales: categorySalesList,
        dateRange: { from: dateRange.from, to: dateRange.to }
      });
    }

  } catch (error) {
    console.error('Sales Report API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
