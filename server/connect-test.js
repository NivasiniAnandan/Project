import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bommal_foods';

async function test() {
  try {
    console.log('Testing MongoDB connection to:', MONGODB_URI ? 'configured URI' : 'localhost');
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', conn.connection.name || 'unknown-db');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

test();
