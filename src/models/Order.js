import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'shipping', 'paid', 'failed', 'cancelled', 'shipped', 'completed'],
      default: 'pending',
    },
    payment: {
      method: { type: String, enum: ['khalti', 'esewa', 'cod'], default: 'khalti' },
      transactionId: { type: String },
      verifiedAt: { type: Date },
      raw: {},
      completedAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
