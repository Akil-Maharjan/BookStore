import { Router } from 'express';
import { submitContact } from '../controllers/contactController.js';
import { contactValidators } from '../middleware/validators.js';

const router = Router();

router.post('/', contactValidators.submit, submitContact);

export default router;
