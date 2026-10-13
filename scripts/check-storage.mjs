#!/usr/bin/env node

/**
 * Data Storage Health Check
 * Run this to verify that data is being saved correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

console.log('\n🔍 Bommal Foods - Data Storage Health Check\n');
console.log('📁 Data Directory:', DATA_DIR);
console.log('');

const requiredFiles = ['users.json', 'products.json', 'orders.json', 'inquiries.json', 'categories.json'];

let allGood = true;

requiredFiles.forEach(file => {
  const filePath = path.join(DATA_DIR, file);
  
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      const count = Array.isArray(data) ? data.length : Object.keys(data).length;
      console.log(`✅ ${file}: ${count} entries`);
    } catch (error) {
      console.log(`❌ ${file}: ERROR - ${error.message}`);
      allGood = false;
    }
  } else {
    console.log(`⚠️  ${file}: Not found (will be created on first use)`);
  }
});

console.log('');

if (allGood) {
  console.log('✅ Storage status: All systems operational!');
  console.log('📝 Data is being saved to JSON files in /data directory');
  console.log('');
  console.log('💡 Tips:');
  console.log('   - All data changes are saved immediately');
  console.log('   - You can edit JSON files manually if needed');
  console.log('   - To use MongoDB instead, update .env.local with MONGODB_URI');
} else {
  console.log('⚠️  Storage status: Some issues detected');
  console.log('💡 Check file permissions and disk space');
}

console.log('');
