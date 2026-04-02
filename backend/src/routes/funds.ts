import { Router } from 'express';
import { body } from 'express-validator';
import * as fundsController from '../controllers/fundsController';
import { authenticate, requireKYC, requireAccreditation } from '../middleware/auth';

const router = Router();

// Public fund listings
router.get('/', fundsController.getFunds);
router.get('/:id', fundsController.getFund);

router.use(authenticate);

router.get('/my/investments', fundsController.getMyInvestments);

router.post(
  '/:id/invest',
  requireKYC,
  requireAccreditation,
  [
    body('amount').isFloat({ min: 1000 }).withMessage('Minimum investment is $1,000'),
  ],
  fundsController.investInFund
);

router.post('/:investmentId/redeem', requireKYC, fundsController.redeemInvestment);

export default router;
