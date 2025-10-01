import { validationResult, body, param } from 'express-validator';

export const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    }
    next();
  },
];

export const authValidators = {
  register: validate([
    body('name').isString().isLength({ min: 2 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ]),
  login: validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ]),
};

export const bookValidators = {
  create: validate([
    body('title').isString().isLength({ min: 1 }),
    body('author').isString().isLength({ min: 1 }),
    body('price_npr').isFloat({ min: 0 }),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('isbn').optional().isString(),
    body('stock').optional().isInt({ min: 0 }),
  ]),
  update: validate([
    body('title').optional().isString().isLength({ min: 1 }),
    body('author').optional().isString().isLength({ min: 1 }),
    body('price_npr').optional().isFloat({ min: 0 }),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('isbn').optional().isString(),
    body('stock').optional().isInt({ min: 0 }),
  ]),
};

export const cartValidators = {
  add: validate([
    body('bookId').isMongoId(),
    body('quantity').optional().isInt({ min: 1 }),
  ]),
  update: validate([
    param('bookId').isMongoId(),
    body('quantity').isInt({ min: 0 }),
  ]),
  remove: validate([
    param('bookId').isMongoId(),
  ]),
};

export const reviewValidators = {
  addOrUpdate: validate([
    param('bookId').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString(),
    body('reviewId').optional().isMongoId(),
  ]),
  byBook: validate([
    param('bookId').isMongoId(),
  ]),
  remove: validate([
    body('reviewId').optional().isMongoId(),
  ]),
};

export const orderValidators = {
  create: validate([
    body('paymentMethod').optional().isIn(['khalti', 'esewa', 'cod']),
    body('shipping').optional().isFloat({ min: 0 }),
  ]),
  updateStatus: validate([
    param('id').isMongoId(),
    body('status').isIn(['pending', 'processing', 'shipping', 'paid', 'failed', 'cancelled', 'shipped', 'completed']),
  ]),
  review: validate([
    param('id').isMongoId(),
    body('isReviewed').isBoolean(),
  ]),
  byId: validate([
    param('id').isMongoId(),
  ]),
};

export const paymentValidators = {
  khalti: validate([
    body('orderId').isMongoId(),
    body('token').isString(),
  ]),
  esewa: validate([
    body('orderId').isMongoId(),
    body('refId').isString(),
    body('amt').optional().isFloat({ min: 0 }),
  ]),
};



export const contactValidators = {
  submit: validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').isString().trim().isLength({ min: 1 }).withMessage('Message is required'),
  ]),
};
