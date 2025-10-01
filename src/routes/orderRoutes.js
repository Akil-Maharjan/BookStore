import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createOrderFromCart, getMyOrders, getOrderById, listAllOrders, updateOrderStatus, deleteOrder, setOrderReview } from '../controllers/orderController.js';
import { orderValidators } from '../middleware/validators.js';

const router = Router();

router.use(protect);

router.post('/', orderValidators.create, createOrderFromCart);
router.get('/admin/all', admin, listAllOrders);
router.patch('/:id/status', orderValidators.updateStatus, updateOrderStatus);
router.patch('/:id/review', admin, orderValidators.review, setOrderReview);
router.delete('/:id', orderValidators.byId, deleteOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

export default router;
