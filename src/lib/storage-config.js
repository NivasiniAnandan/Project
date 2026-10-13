// src/lib/storage-config.js
/**
 * Bommal Foods - Storage Configuration Guide
 * 
 * This application uses a DUAL-MODE STORAGE SYSTEM:
 * 1. JSON Files (Local/Development) - Recommended for local development
 * 2. MongoDB (Production/Remote) - For scalability
 * 
 * HOW IT WORKS:
 * - The app checks if MONGODB_URI is configured in .env.local
 * - If YES: Attempts to connect to MongoDB, falls back to JSON if connection fails
 * - If NO: Uses JSON file storage exclusively
 * 
 * Current Setup: Using JSON File Storage (no MongoDB configured)
 * Data Location: /data/ directory
 * 
 * DATA FILES:
 * - users.json: User accounts (login, registration)
 * - products.json: Product catalog (items, stock, pricing)
 * - orders.json: Customer orders (cart checkout, order history)
 * - inquiries.json: Contact form submissions
 * - categories.json: Product categories
 * 
 * TO ENABLE MONGODB:
 * 1. Update .env.local with your MongoDB connection string:
 *    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bommal_foods
 * 
 * 2. Restart the Next.js dev server
 * 
 * TROUBLESHOOTING:
 * ✅ Data not appearing in admin panel?
 *    - Check /data/ directory for JSON files
 *    - Refresh browser (clear cache if needed)
 * 
 * ✅ Getting "MongoDB unavailable" error?
 *    - This is expected if MONGODB_URI is not configured
 *    - The app automatically falls back to JSON storage
 * 
 * ✅ Want to use MongoDB?
 *    - Set MONGODB_URI in .env.local
 *    - Make sure MongoDB connection string is correct
 *    - Restart the server
 */

export const STORAGE_CONFIG = {
  MODE: process.env.MONGODB_URI ? 'MONGODB' : 'JSON',
  DATA_DIR: process.env.MONGODB_URI ? 'MongoDB Atlas/Local' : './data',
  STATUS: process.env.MONGODB_URI ? 'Production Ready' : 'Development (Local Files)',
};
