import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function POST(req) {
  try {
    const { action, email, password, name, phone, address } = await req.json();

    if (action === 'login') {
      const users = db.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 400 });
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 400 });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user without password hash
      const userRes = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address };
      return NextResponse.json({ token, user: userRes });
    } 
    
    else if (action === 'register') {
      const users = db.getUsers();
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (exists) {
        return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newUser = {
        id: 'usr_' + Date.now(),
        name,
        email,
        passwordHash,
        role: 'retailer', // default role
        phone: phone || '',
        address: address || ''
      };

      users.push(newUser);
      db.saveUsers(users);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userRes = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, address: newUser.address };
      return NextResponse.json({ token, user: userRes });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Auth Error:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}

// Update profile endpoint (needs Authorization header)
export async function PUT(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const { name, phone, address, password } = await req.json();

    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === decoded.id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update fields
    users[userIndex].name = name || users[userIndex].name;
    users[userIndex].phone = phone || users[userIndex].phone;
    users[userIndex].address = address || users[userIndex].address;

    if (password) {
      const salt = bcrypt.genSaltSync(10);
      users[userIndex].passwordHash = bcrypt.hashSync(password, salt);
    }

    db.saveUsers(users);

    const userRes = {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      role: users[userIndex].role,
      phone: users[userIndex].phone,
      address: users[userIndex].address
    };

    return NextResponse.json({ user: userRes });
  } catch (error) {
    console.error('API Profile Update Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
