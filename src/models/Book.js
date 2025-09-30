import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price_npr: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'General', index: true },
    isbn: { type: String, unique: true, sparse: true, trim: true },
    stock: { type: Number, default: 0 },
    coverUrl: { type: String, default: '' },
    coverPublicId: { type: String, default: '' },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text' });

const Book = mongoose.model('Book', bookSchema);
export default Book;
