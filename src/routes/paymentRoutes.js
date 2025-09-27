import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { verifyKhalti, verifyEsewa } from '../controllers/paymentController.js';
import { paymentValidators } from '../middleware/validators.js';

const router = Router();

router.use(protect);

router.post('/khalti/verify', paymentValidators.khalti, verifyKhalti);
router.post('/esewa/verify', paymentValidators.esewa, verifyEsewa);

export default router;
