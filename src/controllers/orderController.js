import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

export const createOrderFromCart = async (req, res) => {
  const userId = req.user._id;
  const { paymentMethod = 'khalti', shipping = 0 } = req.body;

  if (req.user?.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot place orders' });
  }

  const cart = await Cart.findOne({ user: userId }).populate('items.book');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const items = cart.items.map((i) => ({
    book: i.book._id,
    title: i.book.title,
    price_npr: i.book.price_npr,
    quantity: i.quantity,
  }));
  const subtotal = items.reduce((sum, i) => sum + Number(i.price_npr || 0) * i.quantity, 0);
  const total = subtotal + (shipping || 0);

  const initialStatus = paymentMethod === 'cod' ? 'processing' : 'pending';

  const order = await Order.create({
    user: userId,
    items,
    subtotal,
    shipping,
    total,
    payment: { method: paymentMethod },
    status: initialStatus,
    isReviewed: false,
  });

  cart.items = [];
  cart.updatedAt = new Date();
  await cart.save();

  res.status(201).json(order);
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate({ path: 'items.book', select: 'title author price coverUrl' })
    .sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    .populate({ path: 'items.book', select: 'title author price coverUrl' });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

export const listAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate({ path: 'items.book', select: 'title author price coverUrl' })
    .sort({ createdAt: -1 });
  res.json(orders);
};

const allowedStatuses = ['pending', 'processing', 'shipping', 'paid', 'failed', 'cancelled', 'shipped', 'completed'];

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const isOwner = String(order.user._id || order.user) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin) {
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    const allowedUserStatuses = ['completed', 'cancelled'];
    if (!allowedUserStatuses.includes(status)) {
      return res.status(403).json({ message: 'You cannot set this status' });
    }
  }

  if (!order.isReviewed && ['shipping', 'shipped', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Order must be reviewed before advancing to shipping.' });
  }

  order.status = status;
  if (status === 'completed') {
    order.payment.completedAt = new Date();
  }
  if (status === 'cancelled') {
    order.payment.completedAt = undefined;
  }
  if (order.payment?.method === 'cod' && ['shipping', 'shipped', 'completed'].includes(status)) {
    await Cart.updateOne(
      { user: order.user },
      { $set: { items: [], updatedAt: new Date() } }
    );
  }
  await order.save();
  res.json(order);
};

export const setOrderReview = async (req, res) => {
  const { isReviewed } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.isReviewed = Boolean(isReviewed);

  const wasStatus = order.status;

  if (order.isReviewed && ['pending', 'processing'].includes(order.status)) {
    order.status = 'shipping';
  }

  if (!order.isReviewed && order.status === 'shipping') {
    order.status = order.payment?.method === 'cod' ? 'processing' : 'pending';
  }

  await order.save();

  if (
    order.isReviewed &&
    ['shipping', 'shipped', 'completed'].includes(order.status) &&
    order.payment?.method === 'cod'
  ) {
    await Cart.updateOne(
      { user: order.user },
      { $set: { items: [], updatedAt: new Date() } }
    );
  }

  res.json(order);
};

export const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const isOwner = String(order.user) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Not authorized to delete this order' });
  }

  if (!isAdmin && !['pending', 'shipping', 'cancelled', 'failed', 'completed'].includes(order.status)) {
    return res.status(400).json({ message: 'Cannot delete this order' });
  }

  await order.deleteOne();
  res.json({ message: 'Order removed' });
};
