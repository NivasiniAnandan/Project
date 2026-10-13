import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

async function checkMongoStorage() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('⚠️ MongoDB not configured, using JSON storage');
      return false;
    }
    console.log('✅ Using MongoDB for storage');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

function buildUserResponse(user) {
  return {
    id: user._id?.toString?.() || user.id || '',
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
  };
}

export async function POST(req) {
  try {
    const { action, email, password, name, phone, address } = await req.json();
    const useMongo = await checkMongoStorage();

    if (action === 'login') {
      const normalizedEmail = (email || '').toLowerCase().trim();

      if (useMongo) {
        const mongoUser = await User.findOne({ email: normalizedEmail });
        if (mongoUser) {
          const isPasswordValid = bcrypt.compareSync(password, mongoUser.passwordHash);
          if (!isPasswordValid) {
            return NextResponse.json(
              { message: 'Invalid email or password' },
              { status: 401 }
            );
          }

          const token = jwt.sign(
            {
              id: mongoUser._id.toString(),
              email: mongoUser.email,
              role: mongoUser.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return NextResponse.json({
            token,
            user: buildUserResponse(mongoUser),
          });
        }
      }

      const users = db.getUsers();
      const user = users.find((entry) => (entry.email || '').toLowerCase().trim() === normalizedEmail);

      if (!user) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        {
          id: user.id || user._id?.toString?.(),
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        token,
        user: buildUserResponse(user),
      });
    }

    if (action === 'register') {
      const normalizedEmail = (email || '').toLowerCase().trim();

      if (useMongo) {
        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) {
          return NextResponse.json(
            { message: 'User already exists with this email' },
            { status: 400 }
          );
        }

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        const newUser = await User.create({
          name,
          email: normalizedEmail,
          passwordHash,
          role: 'retailer',
          phone: phone || '',
          address: address || '',
        });

        const token = jwt.sign(
          {
            id: newUser._id.toString(),
            email: newUser.email,
            role: newUser.role,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return NextResponse.json({
          token,
          user: buildUserResponse(newUser),
        });
      }

      const users = db.getUsers();
      const exists = users.find((entry) => (entry.email || '').toLowerCase().trim() === normalizedEmail);

      if (exists) {
        return NextResponse.json(
          { message: 'User already exists with this email' },
          { status: 400 }
        );
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      // eslint-disable-next-line react-hooks/purity
      const newUser = {
        id: `usr_${Date.now()}`,
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'retailer',
        phone: phone || '',
        address: address || '',
      };

      const updatedUsers = [...users, newUser];
      db.saveUsers(updatedUsers);

      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        token,
        user: buildUserResponse(newUser),
      });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Auth Error:', error);
    return NextResponse.json(
      { message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

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
    } catch {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { name, phone, address, password } = await req.json();
    const useMongo = await checkMongoStorage();

    if (useMongo) {
      const user = await User.findById(decoded.id);

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.address = address || user.address;

      if (password) {
        const salt = bcrypt.genSaltSync(10);
        user.passwordHash = bcrypt.hashSync(password, salt);
      }

      await user.save();

      return NextResponse.json({ user: buildUserResponse(user) });
    }

    const users = db.getUsers();
    const userIndex = users.findIndex((entry) => entry.id === decoded.id || entry._id?.toString?.() === decoded.id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex];
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (password) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(password, salt);
    }

    users[userIndex] = user;
    db.saveUsers(users);

    return NextResponse.json({ user: buildUserResponse(user) });
  } catch (error) {
    console.error('API Profile Update Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}