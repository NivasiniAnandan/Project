import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

function verifyUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

function makeInvoiceNumber(order) {
  if (order.invoiceNumber) return order.invoiceNumber;
  const year = new Date(order.createdAt || Date.now()).getFullYear();
  const digits = String(order.orderId || order.id || '').replace(/\D/g, '').slice(-6).padStart(6, '0');
  return `INV-${year}-${digits}`;
}

export async function GET(req, { params }) {
  const user = verifyUser(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });

  const { orderId } = await params;

  try {
    let order;
    try {
      const conn = await connectDB();
      if (conn) order = await Order.findOne({ orderId }).lean();
    } catch (error) {
      console.error('Invoice order lookup failed:', error.message);
    }

    if (!order) order = db.getOrders().find((candidate) => (candidate.id || candidate.orderId) === orderId);
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    if (user.role !== 'admin' && order.userId !== user.id) {
      return NextResponse.json({ message: 'You cannot access this order' }, { status: 403 });
    }

    return NextResponse.json({ order: { ...order, invoiceNumber: makeInvoiceNumber(order) } });
  } catch (error) {
    console.error('Invoice order API error:', error);
    return NextResponse.json({ message: 'Unable to retrieve invoice' }, { status: 500 });
  }
}