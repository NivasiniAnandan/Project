import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Order, User } from '@/lib/models';
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
    const orderStatus = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const exportAll = searchParams.get('export') === 'true';
    const pageSize = exportAll ? 10000 : 20;

    const dateRange = getDateRange(fromDate, toDate);

    try {
      await connectDB();

      let query = {
        createdAt: {
          $gte: dateRange.from,
          $lte: dateRange.to
        }
      };

      if (orderStatus && orderStatus !== 'all') {
        query.status = orderStatus;
      }

      const totalCount = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .lean()
        .sort({ createdAt: -1 })
        .skip(exportAll ? 0 : (page - 1) * pageSize)
        .limit(pageSize);

      // Enrich with user info
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            const user = await User.findById(order.userId).lean();
            return {
              ...order,
              customerName: user?.name || 'Unknown',
              customerEmail: order.userEmail || '',
            };
          } catch {
            return {
              ...order,
              customerName: 'Unknown',
              customerEmail: order.userEmail || '',
            };
          }
        })
      );

      const statuses = {
        pending: await Order.countDocuments({ ...query, status: 'pending' }),
        processing: await Order.countDocuments({ ...query, status: 'processing' }),
        shipped: await Order.countDocuments({ ...query, status: 'shipped' }),
        delivered: await Order.countDocuments({ ...query, status: 'delivered' }),
        cancelled: await Order.countDocuments({ ...query, status: 'cancelled' })
      };

      return NextResponse.json({
        orders: enrichedOrders,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        },
        statuses,
        dateRange: { from: dateRange.from, to: dateRange.to }
      });

    } catch (mongoError) {
      console.error('MongoDB error:', mongoError);
      
      // Fallback to JSON storage
      let allOrders = db.getOrders().filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dateRange.from && orderDate <= dateRange.to;
      });

      if (orderStatus && orderStatus !== 'all') {
        allOrders = allOrders.filter(o => o.status === orderStatus);
      }

      allOrders = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalCount = allOrders.length;
      const paginatedOrders = allOrders.slice((page - 1) * pageSize, page * pageSize);

      const statuses = {
        pending: allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        shipped: allOrders.filter(o => o.status === 'shipped').length,
        delivered: allOrders.filter(o => o.status === 'delivered').length,
        cancelled: allOrders.filter(o => o.status === 'cancelled').length
      };

      return NextResponse.json({
        orders: paginatedOrders.map(o => ({
          ...o,
          customerName: 'Unknown',
          customerEmail: o.userEmail || ''
        })),
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        },
        statuses,
        dateRange: { from: dateRange.from, to: dateRange.to }
      });
    }

  } catch (error) {
    console.error('Orders Report API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
