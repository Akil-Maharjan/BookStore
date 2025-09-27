import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCart, addToCart, updateItem, removeItem, clearCart } from '../controllers/cartController.js';
import { cartValidators } from '../middleware/validators.js';

const router = Router();

// All cart endpoints require authentication
router.use(protect);

// Get current user's cart
router.get('/', getCart);

// Add a book to cart (or increase quantity)
router.post('/add', cartValidators.add, addToCart);

// Update quantity of a specific book in the cart
router.put('/item/:bookId', cartValidators.update, updateItem);

// Remove a specific book from the cart
router.delete('/item/:bookId', cartValidators.remove, removeItem);

// Clear entire cart
router.delete('/', clearCart);

export default router;
