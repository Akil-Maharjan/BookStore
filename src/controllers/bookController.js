import Book from '../models/Book.js';
import { isCloudinaryConfigured, uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

export const listBooks = async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '12', 10);
  const q = req.query.q?.trim();
  const category = req.query.category?.trim();
  const sortParam = req.query.sort?.trim();
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

  const filter = {};
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { title: regex },
      { author: regex },
      { category: regex },
      { description: regex },
    ];
  }
  if (category) filter.category = category;
  if (minPrice != null || maxPrice != null) {
    filter.price_npr = {};
    if (minPrice != null) filter.price_npr.$gte = minPrice;
    if (maxPrice != null) filter.price_npr.$lte = maxPrice;
  }

  let sort = { createdAt: -1 };
  switch (sortParam) {
    case 'name-asc':
      sort = { title: 1 };
      break;
    case 'name-desc':
      sort = { title: -1 };
      break;
    case 'price-asc':
      sort = { price_npr: 1 };
      break;
    case 'price-desc':
      sort = { price_npr: -1 };
      break;
    default:
      break;
  }

  const total = await Book.countDocuments(filter);
  const books = await Book.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ page, pages: Math.ceil(total / limit), total, items: books });
};

export const getBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
};

export const createBook = async (req, res) => {
  const { title, author, description, price_npr, category, isbn, stock } = req.body;
  if (!title || !author || price_npr == null) {
    return res.status(400).json({ message: 'title, author and price are required' });
  }

  const data = {
    title,
    author,
    description,
    price_npr,
    category,
    isbn,
    stock,
    createdBy: req.user._id,
  };

  // Support single-file (req.file), fields object (req.files.cover/image/coverUrl), or upload.any() (req.files as array)
  let uploadedFile = req.file || req.files?.cover?.[0] || req.files?.image?.[0] || req.files?.coverUrl?.[0];
  if (!uploadedFile && Array.isArray(req.files) && req.files.length > 0) {
    uploadedFile = req.files[0];
  }
  if (uploadedFile && isCloudinaryConfigured()) {
    const uploaded = await uploadBufferToCloudinary(uploadedFile.buffer);
    data.coverUrl = uploaded.secure_url;
    data.coverPublicId = uploaded.public_id;
  }

  const book = await Book.create(data);
  res.status(201).json(book);
};

export const updateBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const updatable = ['title', 'author', 'description', 'price_npr', 'category', 'isbn', 'stock'];
  for (const key of updatable) {
    if (req.body[key] !== undefined) book[key] = req.body[key];
  }

  // Support single-file (req.file), fields object (req.files.cover/image/coverUrl), or upload.any() (req.files as array)
  let uploadedFile2 = req.file || req.files?.cover?.[0] || req.files?.image?.[0] || req.files?.coverUrl?.[0];
  if (!uploadedFile2 && Array.isArray(req.files) && req.files.length > 0) {
    uploadedFile2 = req.files[0];
  }
  if (uploadedFile2 && isCloudinaryConfigured()) {
    // delete old image if exists
    if (book.coverPublicId) await deleteFromCloudinary(book.coverPublicId);
    const uploaded = await uploadBufferToCloudinary(uploadedFile2.buffer);
    book.coverUrl = uploaded.secure_url;
    book.coverPublicId = uploaded.public_id;
  }

  await book.save();
  res.json(book);
};

export const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (book.coverPublicId) await deleteFromCloudinary(book.coverPublicId);
  await book.deleteOne();
  res.json({ message: 'Book deleted' });
};
