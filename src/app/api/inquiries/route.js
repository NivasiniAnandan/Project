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
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const inquiries = db.getInquiries();
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('API Inquiries Get Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const inquiries = db.getInquiries();
    const newInquiry = {
      id: 'inq_' + Date.now(),
      name,
      email,
      subject,
      message,
      status: 'pending', // pending, replied
      createdAt: new Date().toISOString()
    };

    inquiries.unshift(newInquiry);
    db.saveInquiries(inquiries);

    // Simulate Email Notification trigger
    console.log(`[SIMULATED EMAIL NOTIFICATION] New inquiry from ${name} (${email}): Subject: "${subject}". Email dispatched to admin@bommalfoods.com.`);

    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully. We will contact you soon.' });
  } catch (error) {
    console.error('API Inquiry Post Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Reply to inquiry (Admin only)
export async function PUT(req) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { inquiryId, replyMessage } = await req.json();

    if (!inquiryId || !replyMessage) {
      return NextResponse.json({ message: 'Inquiry ID and reply message are required' }, { status: 400 });
    }

    const inquiries = db.getInquiries();
    const index = inquiries.findIndex(i => i.id === inquiryId);

    if (index === -1) {
      return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });
    }

    inquiries[index].status = 'replied';
    inquiries[index].replyMessage = replyMessage;
    inquiries[index].repliedAt = new Date().toISOString();

    db.saveInquiries(inquiries);

    // Simulate Sending Email Reply
    console.log(`[SIMULATED EMAIL DISPATCH] Sent reply to ${inquiries[index].email}. Message: "${replyMessage}"`);

    return NextResponse.json({ success: true, inquiry: inquiries[index] });
  } catch (error) {
    console.error('API Inquiry Reply Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
