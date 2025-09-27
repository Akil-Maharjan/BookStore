import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authValidators } from '../middleware/validators.js';

const router = Router();

router.post('/register', authValidators.register, register);
router.post('/login', authValidators.login, login);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
