import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { listBooks, getBook, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { bookValidators } from '../middleware/validators.js';

const router = Router();

router.get('/', listBooks);
router.get('/:id', getBook);

// Accept only specific file field names for stricter validation
router.post('/', protect, admin, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'image', maxCount: 1 }]), bookValidators.create, createBook);
router.put('/:id', protect, admin, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'image', maxCount: 1 }]), bookValidators.update, updateBook);
router.delete('/:id', protect, admin, deleteBook);

export default router;
