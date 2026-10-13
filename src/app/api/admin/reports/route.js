import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Order, Product, Category, User } from '@/lib/models';
import { db } from '@/lib/db';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Helper to verify admin token
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

// Helper to get date range
function getDateRange(fromDate, toDate) {
  let from, to;

  if (fromDate && toDate) {
    from = startOfDay(parseISO(fromDate));
    to = endOfDay(parseISO(toDate));
  } else {
    // Default to current month
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
    const reportType = searchParams.get('type') || 'dashboard';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const dateRange = getDateRange(fromDate, toDate);

    try {
      await connectDB();

      // Build the base match query for date filtering
      const dateMatch = {
        createdAt: {
          $gte: dateRange.from,
          $lte: dateRange.to
        }
      };

      if (reportType === 'dashboard' || reportType === 'summary') {
        // Get dashboard summary metrics
        const orders = await Order.find(dateMatch).lean();

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const totalProductsSold = orders.reduce((sum, o) => {
          return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Order status breakdown
        const ordersByStatus = {
          pending: orders.filter(o => o.status === 'pending').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length
        };

        // Payment status breakdown
        const ordersByPaymentStatus = {
          pending: orders.filter(o => o.paymentStatus === 'pending').length,
          invoice_sent: orders.filter(o => o.paymentStatus === 'invoice_sent').length,
          paid: orders.filter(o => o.paymentStatus === 'paid').length
        };

        // Unique customers
        const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

        return NextResponse.json({
          totalOrders,
          totalRevenue,
          totalProductsSold,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          ordersByStatus,
          ordersByPaymentStatus,
          uniqueCustomers,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      }

      return NextResponse.json({ message: 'Report type not found' }, { status: 400 });

    } catch (mongoError) {
      console.error('MongoDB error:', mongoError);
      
      // Fallback to JSON storage
      const orders = db.getOrders().filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dateRange.from && orderDate <= dateRange.to;
      });

      if (reportType === 'dashboard' || reportType === 'summary') {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const totalProductsSold = orders.reduce((sum, o) => {
          return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const ordersByStatus = {
          pending: orders.filter(o => o.status === 'pending').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length
        };

        const ordersByPaymentStatus = {
          pending: orders.filter(o => o.paymentStatus === 'pending').length,
          invoice_sent: orders.filter(o => o.paymentStatus === 'invoice_sent').length,
          paid: orders.filter(o => o.paymentStatus === 'paid').length
        };

        const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

        return NextResponse.json({
          totalOrders,
          totalRevenue,
          totalProductsSold,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          ordersByStatus,
          ordersByPaymentStatus,
          uniqueCustomers,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      }

      return NextResponse.json({ message: 'Report generation failed' }, { status: 500 });
    }

  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
