import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const MONGODB_DB = process.env.MONGODB_DB || 'bommal_foods';

function redactMongoUri(uri) {
  try {
    const parsedUri = new URL(uri);
    parsedUri.password = '***';
    return parsedUri.toString();
  } catch {
    return '[invalid MongoDB URI]';
  }
}

let cached = globalThis.mongoose;

if (!cached) {
  cached = { conn: null, promise: null, isConfigured: null };
  globalThis.mongoose = cached;
}

export async function connectDB() {
  // Check if MongoDB is configured
  if (cached.isConfigured === null) {
    cached.isConfigured = Boolean(MONGODB_URI);
    if (!cached.isConfigured) {
      console.log('📁 Using JSON file storage (MONGODB_URI not configured in .env.local)');
    } else {
      console.log('🗄️ MongoDB configured, attempting connection...');
    }
  }

  if (cached.conn) {
    return cached.conn;
  }

  // If MongoDB is not configured, skip connection attempts
  if (!cached.isConfigured) {
    return null;
  }

  if (!cached.promise) {
    console.log('Attempting MongoDB connection to:', redactMongoUri(MONGODB_URI));
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).then((conn) => {
      cached.conn = conn;
      console.log('✅ MongoDB connected successfully');
      return conn;
    }).catch((err) => {
      console.warn('❌ MongoDB connection failed:', err.message);
      console.log('📁 Falling back to JSON file storage');
      cached.conn = null;
      // Do not permanently cache a transient DNS, network, or Atlas outage.
      cached.promise = null;
      return null;
    });
  }

  return await cached.promise;
}
