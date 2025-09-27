import Cart from '../models/Cart.js';
import Book from '../models/Book.js';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

export const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.book');
  res.json(cart);
};

export const addToCart = async (req, res) => {
  const { bookId, quantity = 1 } = req.body;
  if (!bookId) return res.status(400).json({ message: 'bookId is required' });
  if (req.user?.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot add items to the cart' });
  }
  const qty = Math.max(parseInt(quantity, 10) || 1, 1);

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const cart = await getOrCreateCart(req.user._id);
  const idx = cart.items.findIndex((i) => i.book.toString() === book._id.toString());
  if (idx >= 0) {
    cart.items[idx].quantity = Math.min((cart.items[idx].quantity || 0) + qty, Math.max(book.stock || 99, 1));
  } else {
    cart.items.push({ book: book._id, quantity: Math.min(qty, Math.max(book.stock || 99, 1)) });
  }
  cart.updatedAt = new Date();
  await cart.save();
  await cart.populate('items.book');
  res.status(201).json(cart);
};

export const updateItem = async (req, res) => {
  const { bookId } = req.params;
  const { quantity } = req.body;
  if (quantity == null) return res.status(400).json({ message: 'quantity is required' });
  const qty = parseInt(quantity, 10);

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const cart = await getOrCreateCart(req.user._id);
  const idx = cart.items.findIndex((i) => i.book.toString() === book._id.toString());
  if (idx < 0) return res.status(404).json({ message: 'Item not in cart' });

  if (qty <= 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].quantity = Math.min(qty, Math.max(book.stock || 99, 1));
  }
  cart.updatedAt = new Date();
  await cart.save();
  await cart.populate('items.book');
  res.json(cart);
};

export const removeItem = async (req, res) => {
  const { bookId } = req.params;
  const cart = await getOrCreateCart(req.user._id);
  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.book.toString() !== bookId);
  if (cart.items.length === before) return res.status(404).json({ message: 'Item not in cart' });
  cart.updatedAt = new Date();
  await cart.save();
  await cart.populate('items.book');
  res.json(cart);
};

export const clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.updatedAt = new Date();
  await cart.save();
  res.json(cart);
};
