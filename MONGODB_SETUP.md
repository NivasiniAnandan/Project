# MongoDB Atlas Setup Guide

## Getting Your Connection String with Password

Follow these steps to get your correct MongoDB connection string:

### Step 1: Go to MongoDB Atlas Dashboard
1. Open https://cloud.mongodb.com
2. Log in with your account
3. Click on **Cluster0** (or your cluster name)

### Step 2: Find the Connection String
1. Click the **"Connect"** button
2. Select **"Drivers"** (if not already selected)
3. Choose **"Node.js"** from the dropdown
4. Copy the connection string
   - It will look like: `mongodb+srv://<username>:<password>@cluster0.26tiawx.mongodb.net/?retryWrites=true&w=majority`

### Step 3: Get Your Database User Password
If you don't remember your password, you need to create a new one:

1. In MongoDB Atlas, go to **Security > Database Access**
2. Find your user (e.g., "nivasini2239_db_user")
3. Click the **"Edit"** button (pencil icon)
4. Click **"Edit Password"** to generate a new one
5. MongoDB will show you a generated password - copy it
6. Click **"Autogenerate Secure Password"** for a strong one

### Step 4: Update Your Connection String
Replace the placeholders in your connection string:
- Replace `<username>` with your database user (e.g., nivasini2239_db_user)
- Replace `<password>` with your actual password (no angle brackets)
- Add `/bommal_foods` at the end for database name

**Example:**
```
BEFORE: mongodb+srv://<username>:<password>@cluster0.26tiawx.mongodb.net/?retryWrites=true&w=majority
AFTER:  mongodb+srv://nivasini2239_db_user:MyActualPassword123@cluster0.26tiawx.mongodb.net/bommal_foods?retryWrites=true&w=majority
```

### Step 5: Update .env.local
1. Open `.env.local` in your project
2. Update the MONGODB_URI line with your complete connection string (with password)
3. Save the file
4. Restart your Next.js dev server

### Step 6: Test the Connection
Run this command to verify everything works:
```bash
node scripts/test-mongodb.mjs
```

You should see:
```
✅ Connection successful!
✅ All tests passed! MongoDB Atlas is ready to use.
```

## Common Issues

| Issue | Solution |
|-------|----------|
| **Authentication failed** | Check your password is correct (no angle brackets) |
| **Connection timeout** | Verify IP whitelist includes 0.0.0.0/0 or your IP |
| **Database not found** | Make sure `/bommal_foods` is in the connection string |
| **Cluster not ready** | Wait a few minutes for MongoDB to initialize |

## Next Steps

After connection is verified:
1. Register a new user - it should be saved to MongoDB Atlas
2. Create a product - it should be saved to MongoDB Atlas
3. Place an order - it should be saved to MongoDB Atlas
4. Check MongoDB Atlas dashboard to see all your collections and data!
