import { Router } from 'express';
import { body } from 'express-validator';
import * as commerceController from '../controllers/commerceController';
import { authenticate, requireKYC } from '../middleware/auth';

const router = Router();

// Public product listings
router.get('/products', commerceController.getProducts);
router.get('/products/:id', commerceController.getProduct);

router.use(authenticate);

router.post(
  '/checkout',
  requireKYC,
  [
    body('productId').notEmpty(),
    body('paymentMethod').isIn(['FIAT', 'CRYPTO', 'FINANCE']),
    body('investmentBundle').optional().isBoolean(),
    body('investmentPercent').optional().isFloat({ min: 1, max: 50 }),
  ],
  commerceController.initiateCheckout
);

export default router;
