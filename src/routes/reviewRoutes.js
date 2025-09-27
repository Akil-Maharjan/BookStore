import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listReviewsForBook, addOrUpdateReview, deleteMyReview } from '../controllers/reviewController.js';
import { reviewValidators } from '../middleware/validators.js';

const router = Router();

// Public: list reviews for a book
router.get('/:bookId', reviewValidators.byBook, listReviewsForBook);

// Authenticated: add or update a review for a book
router.post('/:bookId', protect, reviewValidators.addOrUpdate, addOrUpdateReview);

// Authenticated: delete my review for a book
router.delete('/:bookId', protect, reviewValidators.remove, deleteMyReview);

export default router;
