import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'retailer', enum: ['retailer', 'admin'] },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

const loginLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, lowercase: true },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const LoginLog = mongoose.models.LoginLog || mongoose.model('LoginLog', loginLogSchema);
