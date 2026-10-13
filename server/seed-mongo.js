import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, Category, User, Order, Inquiry } from '../src/lib/models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bommal_foods';

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || 'bommal_foods' });
  console.log('Connected to MongoDB for seeding');

  const dataDir = path.join(process.cwd(), 'data');

  // Helper to read JSON file
  const read = (file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));

  // Seed categories
  try {
    const categories = read('categories.json');
    for (const cat of categories) {
      await Category.updateOne({ id: cat.id }, { $set: cat }, { upsert: true });
    }
    console.log('Seeded categories');
  } catch (e) { console.error('Category seed error', e.message); }

  // Seed products
  try {
    const products = read('products.json');
    for (const p of products) {
      const doc = { ...p };
      await Product.updateOne(
        { 'metadata.sourceId': p.id },
        { $set: { ...doc, id: p.id, 'metadata.sourceId': p.id } },
        { upsert: true }
      );
    }
    console.log('Seeded products');
  } catch (e) { console.error('Product seed error', e.message); }

  // Seed users
  try {
    const users = read('users.json');
    for (const u of users) {
      await User.updateOne({ email: u.email.toLowerCase() }, { $set: { name: u.name, email: u.email.toLowerCase(), passwordHash: u.passwordHash, role: u.role || 'retailer', phone: u.phone || '', address: u.address || '' } }, { upsert: true });
    }
    console.log('Seeded users');
  } catch (e) { console.error('User seed error', e.message); }

  // Inquiries
  try {
    const inquiries = read('inquiries.json');
    for (const i of inquiries) {
      await Inquiry.updateOne({ message: i.message, email: i.email }, { $set: { name: i.name, email: i.email, subject: i.subject, message: i.message, status: i.status || 'pending' } }, { upsert: true });
    }
    console.log('Seeded inquiries');
  } catch (e) { console.error('Inquiry seed error', e.message); }

  await mongoose.disconnect();
  console.log('Seeding complete');
  process.exit(0);
}

seed().catch((e) => { console.error('Seeding failed', e); process.exit(2); });
