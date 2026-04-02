import { Router } from 'express';
import { body } from 'express-validator';
import * as walletController from '../controllers/walletController';
import { authenticate, requireKYC } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);

router.post(
  '/deposit',
  requireKYC,
  [body('amount').isFloat({ min: 10 }).withMessage('Minimum deposit is $10')],
  walletController.depositFunds
);

router.post(
  '/withdraw',
  requireKYC,
  [
    body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal is $10'),
    body('bankAccountId').notEmpty(),
  ],
  walletController.withdrawFunds
);

export default router;
