import mongoose from 'mongoose';
import { normalizeProduct } from './productVariants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'retailer', enum: ['retailer', 'wholesale', 'admin'] },
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

// Product schema
const productVariantSchema = new mongoose.Schema(
  {
    packSize: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    wholesalePrice: { type: Number, default: null, min: 0 },
    wholesaleMinimumQuantity: { type: Number, default: 1, min: 1 }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    unit: { type: String, default: '' },
    packSize: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    variants: { type: [productVariantSchema], default: [] },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    categoryId: { type: String, default: '' },
    images: [{ type: String }],
    specs: { type: Object, default: {} },
    benefits: [{ type: String }],
    usage: [{ type: String }],
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

// Category schema
const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, default: '' },
    image: { type: String, default: '' }
  },
  { timestamps: true }
);

// Order schema
const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    items: [{ type: Object }],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    invoiceNumber: { type: String, unique: true, sparse: true },
    shippingAddress: { type: Object, default: {} },
    paymentMethod: { type: String, default: 'invoice' },
    transferId: { type: String, required: true, trim: true },
    status: { type: String, default: 'pending' },
    paymentStatus: { type: String, default: 'pending' },
    verifiedAt: { type: Date },
    verifiedBy: { type: String, default: '' },
    verifiedByEmail: { type: String, default: '' },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
);

// Inquiry schema
const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'pending' },
    replyMessage: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);

export { normalizeProduct };
