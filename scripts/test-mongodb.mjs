#!/usr/bin/env node

/**
 * MongoDB Atlas Connection Tester
 * Run this to verify your MongoDB Atlas connection is working
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI?.trim();

console.log('\n🔍 MongoDB Atlas Connection Test\n');

if (!MONGODB_URI) {
  console.log('⚠️  MONGODB_URI not configured in .env.local');
  console.log('\n📝 To enable MongoDB Atlas:');
  console.log('1. Open .env.local');
  console.log('2. Set MONGODB_URI to your MongoDB Atlas connection string');
  console.log('3. Make sure to replace <db_password> with your actual password');
  console.log('\nExample:');
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bommal_foods');
  console.log('');
  process.exit(0);
}

function redactMongoUri(uri) {
  try {
    const parsedUri = new URL(uri);
    parsedUri.password = '***';
    return parsedUri.toString();
  } catch {
    return '[invalid MongoDB URI]';
  }
}

console.log('🔗 Connection string: ' + redactMongoUri(MONGODB_URI));
console.log('');

async function testConnection() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    console.log('✅ Connection successful!');
    console.log('📊 Database:', conn.connection.name);
    
    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📋 Collections found:', collections.map(c => c.name).join(', ') || 'None');
    
    // Test write
    const testData = {
      timestamp: new Date(),
      testMessage: 'Connection test successful'
    };
    
    console.log('\n📝 Testing write operation...');
    const testCollection = conn.connection.collection('_connection_test');
    const result = await testCollection.insertOne(testData);
    console.log('✅ Write successful! Document ID:', result.insertedId);
    
    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Cleaned up test data');
    
    console.log('\n✅ All tests passed! MongoDB Atlas is ready to use.');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check your connection string is correct');
    console.log('2. Replace <db_password> with your actual Atlas password');
    console.log('3. Verify your IP address is whitelisted in MongoDB Atlas');
    console.log('4. Check your cluster status in MongoDB Atlas dashboard');
    
    process.exit(1);
  }
}

testConnection();
