import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Inquiry } from '@/lib/models';
import { db } from '@/lib/db';

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

    try {
      await connectDB();
      const inquiries = await Inquiry.find({}).lean();
      return NextResponse.json({ inquiries });
    } catch (e) {
      const inquiries = db.getInquiries();
      return NextResponse.json({ inquiries });
    }
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

    try {
      const conn = await connectDB();
      
      // If MongoDB is configured but connection failed
      if (process.env.MONGODB_URI && !conn) {
        console.error('❌ MongoDB configured but unable to connect for inquiry creation');
        return NextResponse.json(
          { message: 'Database connection failed. Please try again.' },
          { status: 503 }
        );
      }
      
      // If MongoDB is available, use it
      if (conn) {
        console.log('📝 Creating inquiry in MongoDB...');
        await Inquiry.create({ name, email, subject, message, status: 'pending' });
        console.log(`✅ New inquiry from ${name} (${email}): Subject: "${subject}". Stored in MongoDB.`);
        return NextResponse.json({ success: true, message: 'Inquiry submitted successfully. We will contact you soon.' });
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
    console.log('📁 Using JSON file storage for inquiry');
    const inquiries = db.getInquiries();
    const newInquiry = {
      id: 'inq_' + Date.now(),
      name,
      email,
      subject,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    inquiries.unshift(newInquiry);
    db.saveInquiries(inquiries);
    console.log(`[SIMULATED EMAIL NOTIFICATION] New inquiry from ${name} (${email}): Subject: "${subject}". Stored in JSON.`);
    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully. We will contact you soon.' });
  } catch (error) {
    console.error('API Inquiry Post Error:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
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

    try {
      await connectDB();
      const updated = await Inquiry.findByIdAndUpdate(inquiryId, { status: 'replied', replyMessage, repliedAt: new Date() }, { new: true }).lean();
      if (!updated) return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });
      console.log(`[SIMULATED EMAIL DISPATCH] Sent reply to ${updated.email}. Message: "${replyMessage}"`);
      return NextResponse.json({ success: true, inquiry: updated });
    } catch (e) {
      const inquiries = db.getInquiries();
      const index = inquiries.findIndex(i => i.id === inquiryId);

      if (index === -1) return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });

      inquiries[index].status = 'replied';
      inquiries[index].replyMessage = replyMessage;
      inquiries[index].repliedAt = new Date().toISOString();
      db.saveInquiries(inquiries);
      console.log(`[SIMULATED EMAIL DISPATCH] Sent reply (file fallback) to ${inquiries[index].email}. Message: "${replyMessage}"`);
      return NextResponse.json({ success: true, inquiry: inquiries[index] });
    }
  } catch (error) {
    console.error('API Inquiry Reply Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
