import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiOracleService } from '../services/aiOracleService';
import { prisma } from '../config/database';

export const getForecast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { symbol } = req.params;
    const { horizon = '30d' } = req.query;
    const forecast = await aiOracleService.getForecast(symbol.toUpperCase(), String(horizon));
    res.json({ success: true, data: forecast });
  } catch (error) {
    next(error);
  }
};

export const getOptimalAllocation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const allocation = await aiOracleService.getOptimalAllocation();
    res.json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

export const getSentiment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { symbol } = req.params;
    const sentiment = await aiOracleService.getSentiment(symbol.toUpperCase());
    res.json({ success: true, data: sentiment });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioRisk = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user!.id },
      include: { holdings: { include: { asset: { select: { symbol: true, type: true } } } } },
    });

    const symbols = portfolio?.holdings.map((h) => h.asset.symbol) || [];
    const risk = await aiOracleService.getPortfolioRisk(symbols);

    res.json({ success: true, data: risk });
  } catch (error) {
    next(error);
  }
};
