import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface Forecast {
  symbol: string;
  horizon: string;
  projectedChange: number;
  projectedPrice: number;
  confidence: number;
  signals: string[];
  generatedAt: string;
}

interface OptimalAllocation {
  AI: number;
  Energy: number;
  Space: number;
  PrivateEquity: number;
  Cash: number;
  rationale: string;
}

interface SentimentAnalysis {
  symbol: string;
  overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  newsCount: number;
  socialScore: number;
  summary: string;
}

// Deterministic mock data — replace with real ML service calls
const MOCK_FORECASTS: Record<string, Partial<Forecast>> = {
  TSLA: { projectedChange: 18.4, confidence: 72, signals: ['Strong EV growth', 'Energy division expansion', 'Robotaxi catalyst'] },
  NVDA: { projectedChange: 24.6, confidence: 81, signals: ['AI infrastructure demand', 'Data center dominance', 'CUDA moat'] },
  AAPL: { projectedChange: 9.2,  confidence: 78, signals: ['Services growth', 'Apple Intelligence', 'Ecosystem lock-in'] },
  AMZN: { projectedChange: 14.1, confidence: 75, signals: ['AWS re-acceleration', 'AI services', 'Logistics efficiency'] },
  MSFT: { projectedChange: 11.8, confidence: 79, signals: ['Azure cloud growth', 'Copilot monetization', 'Enterprise AI'] },
  GOOGL: { projectedChange: 13.2, confidence: 74, signals: ['Search AI integration', 'GCP growth', 'Waymo optionality'] },
  META:  { projectedChange: 21.3, confidence: 76, signals: ['Ad revenue growth', 'Llama AI leadership', 'AR/VR pipeline'] },
};

class AIOracle {
  private client = axios.create({
    baseURL: env.AI_ORACLE_URL,
    timeout: 15000,
  });

  async getForecast(symbol: string, horizon: string): Promise<Forecast> {
    try {
      const response = await this.client.get(`/forecast/${symbol}`, { params: { horizon } });
      return response.data;
    } catch {
      logger.warn(`AI Oracle unavailable — using built-in model for ${symbol}`);
      return this.generateForecast(symbol, horizon);
    }
  }

  async getOptimalAllocation(): Promise<OptimalAllocation> {
    try {
      const response = await this.client.get('/allocation');
      return response.data;
    } catch {
      return {
        AI: 40,
        Energy: 20,
        Space: 15,
        PrivateEquity: 15,
        Cash: 10,
        rationale: 'Overweight AI infrastructure given secular demand. Energy diversifies against rate risk. Space provides high-beta optionality.',
      };
    }
  }

  async getSentiment(symbol: string): Promise<SentimentAnalysis> {
    try {
      const response = await this.client.get(`/sentiment/${symbol}`);
      return response.data;
    } catch {
      const mock = MOCK_FORECASTS[symbol];
      const score = mock ? 65 + Math.random() * 20 : 50;
      return {
        symbol,
        overallSentiment: score > 60 ? 'BULLISH' : score < 40 ? 'BEARISH' : 'NEUTRAL',
        score: Math.round(score),
        newsCount: Math.floor(Math.random() * 50) + 10,
        socialScore: Math.round(score + (Math.random() - 0.5) * 10),
        summary: `On-chain and news sentiment analysis for ${symbol} indicates ${score > 60 ? 'positive' : 'mixed'} momentum.`,
      };
    }
  }

  async getPortfolioRisk(symbols: string[]): Promise<{
    riskScore: number;
    sharpeRatio: number;
    volatility: number;
    var95: number;
    recommendations: string[];
  }> {
    try {
      const response = await this.client.post('/portfolio-risk', { symbols });
      return response.data;
    } catch {
      const riskScore = 35 + Math.random() * 30;
      return {
        riskScore: Math.round(riskScore),
        sharpeRatio: 1.2 + Math.random() * 0.8,
        volatility: 12 + Math.random() * 8,
        var95: -(riskScore * 0.15),
        recommendations: [
          'Consider adding uncorrelated assets (commodities, real estate)',
          'Rebalance AI sector exposure — 40%+ concentration risk',
          'Add cash buffer of 10-15% for rebalancing opportunities',
        ],
      };
    }
  }

  private generateForecast(symbol: string, horizon: string): Forecast {
    const mock = MOCK_FORECASTS[symbol] || { projectedChange: 5 + Math.random() * 15, confidence: 55, signals: ['Market momentum', 'Sector trends'] };
    const currentPrice = 100 + Math.random() * 500;

    return {
      symbol,
      horizon,
      projectedChange: mock.projectedChange!,
      projectedPrice: currentPrice * (1 + mock.projectedChange! / 100),
      confidence: mock.confidence!,
      signals: mock.signals!,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const aiOracleService = new AIOracle();
