import { Router } from 'express';
import * as portfolioController from '../controllers/portfolioController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', portfolioController.getPortfolio);
router.get('/holdings', portfolioController.getHoldings);
router.get('/performance', portfolioController.getPerformance);
router.get('/allocation', portfolioController.getAllocation);

export default router;
