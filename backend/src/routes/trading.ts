import { Router } from 'express';
import { body, query } from 'express-validator';
import * as tradingController from '../controllers/tradingController';
import { authenticate, requireKYC } from '../middleware/auth';
import { tradeRateLimit } from '../middleware/rateLimit';

const router = Router();

// Public market data
router.get('/assets', tradingController.getAssets);
router.get('/assets/:symbol', tradingController.getAsset);
router.get('/assets/:symbol/chart', tradingController.getAssetChart);

// Authenticated trading
router.use(authenticate);

router.get('/orders', tradingController.getOrders);
router.get('/orders/:id', tradingController.getOrder);

router.post(
  '/buy',
  requireKYC,
  tradeRateLimit,
  [
    body('assetId').notEmpty(),
    body('amount').isFloat({ min: 1 }),
    body('type').optional().isIn(['MARKET', 'LIMIT']),
  ],
  tradingController.buyAsset
);

router.post(
  '/sell',
  requireKYC,
  tradeRateLimit,
  [
    body('assetId').notEmpty(),
    body('quantity').isFloat({ min: 0.000001 }),
  ],
  tradingController.sellAsset
);

router.delete('/orders/:id', tradingController.cancelOrder);

export default router;
