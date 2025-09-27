import { Router } from 'express';
import authRoutes from './authRoutes.js';
import bookRoutes from './bookRoutes.js';
import cartRoutes from './cartRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import contactRoutes from './contactRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Feature routers
router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/cart', cartRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/contact', contactRoutes);

export default router;
