import axios from 'axios';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

// Khalti verify
export const verifyKhalti = async (req, res) => {
  const { orderId, token } = req.body;
  if (!orderId || !token) return res.status(400).json({ message: 'orderId and token are required' });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  try {
    const resp = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      { token, amount: Math.round(order.total * 100) },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    const shouldAdvanceToShipping = order.isReviewed;
    order.status = shouldAdvanceToShipping ? 'shipping' : 'processing';
    order.payment.transactionId = resp.data.idx || resp.data.token || token;
    order.payment.verifiedAt = new Date();
    order.payment.raw = resp.data;
    const cart = await Cart.findOne({ user: order.user });
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
      await cart.save();
    }
    await order.save();
    res.json({ message: 'Payment verified', order });
  } catch (err) {
    order.status = 'failed';
    await order.save();
    res.status(400).json({ message: 'Khalti verification failed', error: err.response?.data || err.message });
  }
};

// eSewa verify (simplified)
export const verifyEsewa = async (req, res) => {
  const { orderId, refId, amt } = req.body;
  if (!orderId || !refId) return res.status(400).json({ message: 'orderId and refId are required' });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  try {
    // Note: eSewa verification flow varies; this is a simplified placeholder using epay endpoints
    const params = new URLSearchParams();
    params.append('amt', amt || order.total);
    params.append('rid', refId);
    params.append('pid', String(order._id));
    params.append('scd', process.env.ESEWA_MERCHANT_CODE || '');

    const resp = await axios.post('https://uat.esewa.com.np/epay/transrec', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const ok = typeof resp.data === 'string' && resp.data.includes('Success');
    if (!ok) throw new Error('Verification not successful');

    const shouldAdvanceToShipping = order.isReviewed;
    order.status = shouldAdvanceToShipping ? 'shipping' : 'processing';
    order.payment.transactionId = refId;
    order.payment.verifiedAt = new Date();
    order.payment.raw = { response: resp.data };
    const cart = await Cart.findOne({ user: order.user });
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
      await cart.save();
    }
    await order.save();
    res.json({ message: 'Payment verified', order });
  } catch (err) {
    order.status = 'failed';
    await order.save();
    res.status(400).json({ message: 'eSewa verification failed', error: err.response?.data || err.message });
  }
};
