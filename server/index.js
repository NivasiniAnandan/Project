import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'bommal_foods';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing from .env file');
  process.exit(1);
}

async function start() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
    });

    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${MONGODB_DB}`);

    // -----------------------------
    // REGISTER
    // -----------------------------
    app.post('/auth/register', async (req, res) => {
      try {
        const {
          name,
          email,
          password,
          phone,
          address,
        } = req.body;

        if (!name || !email || !password) {
          return res.status(400).json({
            message: 'Missing fields',
          });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const exists = await User.findOne({
          email: normalizedEmail,
        });

        if (exists) {
          return res.status(400).json({
            message: 'User already exists',
          });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        // Create user
        const newUser = await User.create({
          name,
          email: normalizedEmail,
          passwordHash,
          phone: phone || '',
          address: address || '',
        });

        // Generate JWT token
        const token = jwt.sign(
          {
            id: newUser._id.toString(),
            email: newUser.email,
          },
          JWT_SECRET,
          {
            expiresIn: '7d',
          }
        );

        return res.json({
          message: 'Registration successful',
          token,
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
          },
        });
      } catch (err) {
        console.error('❌ Registration error:', err);

        return res.status(500).json({
          message: 'Server error',
        });
      }
    });

    // -----------------------------
    // LOGIN
    // -----------------------------
    app.post('/auth/login', async (req, res) => {
      try {
        const {
          email,
          password,
        } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            message: 'Missing credentials',
          });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const user = await User.findOne({
          email: normalizedEmail,
        });

        if (!user) {
          return res.status(401).json({
            message: 'Invalid email or password',
          });
        }

        // Check password
        const valid = bcrypt.compareSync(
          password,
          user.passwordHash
        );

        if (!valid) {
          return res.status(401).json({
            message: 'Invalid email or password',
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            id: user._id.toString(),
            email: user.email,
          },
          JWT_SECRET,
          {
            expiresIn: '7d',
          }
        );

        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      } catch (err) {
        console.error('❌ Login error:', err);

        return res.status(500).json({
          message: 'Server error',
        });
      }
    });

    // -----------------------------
    // HEALTH CHECK
    // -----------------------------
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        mongodb: mongoose.connection.readyState === 1
          ? 'Connected'
          : 'Disconnected',
      });
    });

    // -----------------------------
    // START SERVER
    // -----------------------------
    const port = process.env.PORT || 4000;

    app.listen(port, () => {
      console.log(
        `🚀 Auth server running on http://localhost:${port}`
      );
    });

  } catch (error) {
    console.error('❌ Failed to start server');

    if (error?.codeName === 'AtlasError') {
      console.error(
        'MongoDB Atlas authentication failed.'
      );
      console.error(
        'Check your database username and password in .env'
      );
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

start();