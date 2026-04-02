import { Router } from 'express';
import * as oracleController from '../controllers/oracleController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/forecast/:symbol', oracleController.getForecast);
router.get('/allocation', oracleController.getOptimalAllocation);
router.get('/sentiment/:symbol', oracleController.getSentiment);
router.get('/risk', authenticate, oracleController.getPortfolioRisk);

export default router;
