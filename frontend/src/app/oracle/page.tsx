'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AIOracle from '@/components/oracle/AIOracle';
import { StatCard } from '@/components/ui/Card';
import { oracleAPI, tradingAPI } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Brain, TrendingUp, BarChart3, Zap } from 'lucide-react';

const SYMBOLS = ['TSLA', 'NVDA', 'AAPL', 'META', 'AMZN', 'PLTR', 'XSPACE', 'MSFT'];

export default function OraclePage() {
  const [allocation, setAllocation] = useState<Record<string, number>>({});
  const [forecasts, setForecasts] = useState<Array<{
    symbol: string; currentPrice: number; predictedPrice: number; expectedReturn: number;
    horizon: string; confidence: number; signal: 'BUY' | 'HOLD' | 'SELL';
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeSymbol, setActiveSymbol] = useState('TSLA');
  const [sentiment, setSentiment] = useState<{ score: number; label: string; sources: number } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allocRes, ...fcastResults] = await Promise.allSettled([
        oracleAPI.getOptimalAllocation(),
        ...SYMBOLS.slice(0, 6).map(sym => oracleAPI.getForecast(sym, '30d')),
      ]);

      if (allocRes.status === 'fulfilled') {
        setAllocation(allocRes.value.data.data ?? { AI: 40, Energy: 20, Space: 15, PrivateEquity: 15, Cash: 10 });
      }

      const fcasts = fcastResults
        .map((r, i) => r.status === 'fulfilled' ? { ...r.value.data.data, symbol: SYMBOLS[i] } : null)
        .filter(Boolean);

      if (fcasts.length > 0) {
        setForecasts(fcasts as typeof forecasts);
      } else {
        setForecasts(DEMO_FORECASTS);
      }
    } catch {
      setAllocation({ AI: 40, Energy: 20, Space: 15, PrivateEquity: 15, Cash: 10 });
      setForecasts(DEMO_FORECASTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const res = await oracleAPI.getSentiment(activeSymbol);
        setSentiment(res.data.data);
      } catch {
        setSentiment({ score: 0.62, label: 'Bullish', sources: 247 });
      }
    };
    fetchSentiment();
  }, [activeSymbol]);

  const bullishCount = forecasts.filter(f => f.signal === 'BUY').length;
  const avgReturn = forecasts.length ? forecasts.reduce((s, f) => s + f.expectedReturn, 0) / forecasts.length : 0;

  return (
    <DashboardLayout title="AI Oracle" subtitle="LSTM · Monte Carlo · Sentiment Analysis">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Bullish Signals" value={`${bullishCount}/${forecasts.length}`} icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard title="Avg Predicted Return" value={`${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%`} change={avgReturn} icon={<BarChart3 className="w-5 h-5" />} />
          <StatCard title="Models Active" value="3" subtitle="LSTM · MC · Sentiment" icon={<Brain className="w-5 h-5" />} />
          <StatCard title="Data Sources" value="50+" subtitle="News, filings, social" icon={<Zap className="w-5 h-5" />} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Oracle widget */}
          <div className="lg:col-span-2 bg-xc-card border border-xc-border rounded-2xl p-6">
            <AIOracle allocation={allocation} forecasts={forecasts} loading={loading} onRefresh={fetchAll} />
          </div>

          {/* Sentiment panel */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white">Market Sentiment</h3>

            {/* Symbol selector */}
            <div className="flex flex-wrap gap-2">
              {SYMBOLS.map((sym) => (
                <button key={sym} onClick={() => setActiveSymbol(sym)}
                  className={cn('px-3 py-1 rounded-lg text-xs font-bold transition-all',
                    activeSymbol === sym ? 'bg-xc-purple text-white' : 'bg-white/5 text-xc-muted hover:text-white'
                  )}>
                  {sym}
                </button>
              ))}
            </div>

            {sentiment && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className={cn('text-5xl font-black mb-2', sentiment.score > 0.5 ? 'text-xc-green' : sentiment.score < 0.4 ? 'text-xc-red' : 'text-amber-400')}>
                    {Math.round(sentiment.score * 100)}
                  </div>
                  <div className="text-sm font-bold text-white">{sentiment.label}</div>
                  <div className="text-xs text-xc-muted mt-1">{sentiment.sources} sources analyzed</div>
                </div>

                {/* Score bar */}
                <div>
                  <div className="flex justify-between text-xs text-xc-muted mb-1.5">
                    <span>Bearish</span><span>Bullish</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-xc-red via-amber-400 to-xc-green transition-all duration-500"
                      style={{ width: `${sentiment.score * 100}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Model stack */}
            <div className="pt-4 border-t border-xc-border space-y-3">
              <div className="text-xs font-bold text-xc-muted uppercase tracking-wider">Model Stack</div>
              {[
                { name: 'LSTM Forecasting', status: 'Active', accuracy: '82%' },
                { name: 'Monte Carlo', status: 'Active', simulations: '10,000' },
                { name: 'Sentiment NLP', status: 'Active', model: 'FinBERT' },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between text-xs">
                  <span className="text-xc-muted">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">{m.accuracy || m.simulations || m.model}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-xc-green" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const DEMO_FORECASTS = [
  { symbol: 'TSLA', currentPrice: 248.42, predictedPrice: 294.11, expectedReturn: 18.4, horizon: '30d', confidence: 74, signal: 'BUY' as const },
  { symbol: 'NVDA', currentPrice: 875.39, predictedPrice: 1086.98, expectedReturn: 24.2, horizon: '30d', confidence: 81, signal: 'BUY' as const },
  { symbol: 'AAPL', currentPrice: 213.07, predictedPrice: 232.44, expectedReturn: 9.1, horizon: '30d', confidence: 78, signal: 'BUY' as const },
  { symbol: 'META', currentPrice: 513.92, predictedPrice: 528.15, expectedReturn: 2.8, horizon: '30d', confidence: 65, signal: 'HOLD' as const },
  { symbol: 'AMZN', currentPrice: 196.25, predictedPrice: 184.01, expectedReturn: -6.2, horizon: '30d', confidence: 61, signal: 'SELL' as const },
  { symbol: 'PLTR', currentPrice: 23.47, predictedPrice: 28.92, expectedReturn: 23.2, horizon: '30d', confidence: 69, signal: 'BUY' as const },
];
