import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Order, User } from '@/lib/models';
import { db } from '@/lib/db';
import { parseISO, startOfDay, endOfDay, format } from 'date-fns';

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
    const reportType = searchParams.get('type') || 'customers';

    const dateRange = getDateRange(fromDate, toDate);

    try {
      await connectDB();

      const dateMatch = {
        createdAt: {
          $gte: dateRange.from,
          $lte: dateRange.to
        }
      };

      if (reportType === 'customers') {
        // Customer/Retailer report
        const orders = await Order.find(dateMatch).lean();

        const customerData = {};
        orders.forEach(order => {
          if (!customerData[order.userId]) {
            customerData[order.userId] = {
              userId: order.userId,
              email: order.userEmail,
              orderCount: 0,
              totalSpent: 0,
              lastOrderDate: null,
              statuses: {}
            };
          }
          customerData[order.userId].orderCount += 1;
          customerData[order.userId].totalSpent += order.total;
          customerData[order.userId].lastOrderDate = new Date(order.createdAt);
          
          if (!customerData[order.userId].statuses[order.status]) {
            customerData[order.userId].statuses[order.status] = 0;
          }
          customerData[order.userId].statuses[order.status] += 1;
        });

        // Get user names from MongoDB
        let customers = [];
        for (const [userId, data] of Object.entries(customerData)) {
          try {
            const user = await User.findById(userId).lean();
            customers.push({
              ...data,
              name: user?.name || 'Unknown',
              customerEmail: data.email
            });
          } catch {
            customers.push({
              ...data,
              name: 'Unknown',
              customerEmail: data.email
            });
          }
        }

        customers = customers.sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json({
          customers,
          totalCustomers: customers.length,
          totalSpent: Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) * 100) / 100,
          totalOrders: orders.length,
          averageOrderValue: Math.round((orders.length > 0 ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / orders.length) : 0) * 100) / 100,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      } else if (reportType === 'payments') {
        // Payment report
        const orders = await Order.find(dateMatch).lean();

        const payments = orders.map(order => ({
          orderId: order.orderId || order.id,
          userId: order.userId,
          customerEmail: order.userEmail,
          paymentDate: format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          paymentMethod: order.paymentMethod,
          amount: order.total,
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          transactionId: order.transactionId || 'N/A'
        })).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        const paymentStatuses = {
          pending: payments.filter(p => p.paymentStatus === 'pending').length,
          invoice_sent: payments.filter(p => p.paymentStatus === 'invoice_sent').length,
          paid: payments.filter(p => p.paymentStatus === 'paid').length
        };

        const totalAmount = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;

        return NextResponse.json({
          payments,
          totalPayments: payments.length,
          totalAmount,
          paymentStatuses,
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

      if (reportType === 'customers') {
        const customerData = {};
        orders.forEach(order => {
          if (!customerData[order.userId]) {
            customerData[order.userId] = {
              userId: order.userId,
              email: order.userEmail,
              orderCount: 0,
              totalSpent: 0,
              lastOrderDate: null,
              statuses: {}
            };
          }
          customerData[order.userId].orderCount += 1;
          customerData[order.userId].totalSpent += order.total;
          customerData[order.userId].lastOrderDate = new Date(order.createdAt);
          
          if (!customerData[order.userId].statuses[order.status]) {
            customerData[order.userId].statuses[order.status] = 0;
          }
          customerData[order.userId].statuses[order.status] += 1;
        });

        const customers = Object.entries(customerData)
          .map(([_, data]) => ({ ...data, name: 'Unknown', customerEmail: data.email }))
          .sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json({
          customers,
          totalCustomers: customers.length,
          totalSpent: Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) * 100) / 100,
          totalOrders: orders.length,
          averageOrderValue: Math.round((orders.length > 0 ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / orders.length) : 0) * 100) / 100,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      } else if (reportType === 'payments') {
        const payments = orders.map(order => ({
          orderId: order.orderId || order.id,
          userId: order.userId,
          customerEmail: order.userEmail,
          paymentDate: format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          paymentMethod: order.paymentMethod,
          amount: order.total,
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          transactionId: order.transactionId || 'N/A'
        })).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        const paymentStatuses = {
          pending: payments.filter(p => p.paymentStatus === 'pending').length,
          invoice_sent: payments.filter(p => p.paymentStatus === 'invoice_sent').length,
          paid: payments.filter(p => p.paymentStatus === 'paid').length
        };

        const totalAmount = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;

        return NextResponse.json({
          payments,
          totalPayments: payments.length,
          totalAmount,
          paymentStatuses,
          dateRange: { from: dateRange.from, to: dateRange.to }
        });
      }

      return NextResponse.json({ message: 'Invalid report type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Customers/Payments Report API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
