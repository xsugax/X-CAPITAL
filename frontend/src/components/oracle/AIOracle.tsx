'use client';

import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrendingUp, TrendingDown, Brain, BarChart3, RefreshCw } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';

interface Forecast {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  expectedReturn: number;
  horizon: string;
  confidence: number;
  signal: 'BUY' | 'HOLD' | 'SELL';
  sentiment?: { score: number; label: string };
}

interface AIOracle {
  allocation: Record<string, number>;
  forecasts?: Forecast[];
  loading?: boolean;
  onRefresh?: () => void;
}

const SIGNAL_CONFIG = {
  BUY: { variant: 'success' as const, icon: TrendingUp, color: '#10b981' },
  SELL: { variant: 'danger' as const, icon: TrendingDown, color: '#ef4444' },
  HOLD: { variant: 'warning' as const, icon: BarChart3, color: '#d97706' },
};

export default function AIOracle({ allocation, forecasts = [], loading = false, onRefresh }: AIOracle) {
  const allocData = Object.entries(allocation).map(([name, value]) => ({ name, value: Number(value) }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center shadow-lg shadow-black/50/50">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white">AI Oracle</h3>
            <p className="text-xs text-xc-muted">LSTM + Monte Carlo + Sentiment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple">LIVE</Badge>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} loading={loading} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Optimal allocation bar chart */}
      <div className="bg-xc-dark/40 rounded-xl p-4 border border-xc-border/60">
        <div className="text-xs font-bold text-xc-muted mb-3 uppercase tracking-wider">Optimal Allocation</div>
        {loading ? (
          <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
        ) : (
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Bar dataKey="value" fill="#7c3aed" radius={4} />
                <Tooltip
                  formatter={(v: number) => [`${v}%`]}
                  contentStyle={{ background: '#0d0d1e', border: '1px solid #1a1a3a', borderRadius: 8, fontSize: 11 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {allocData.map(({ name, value }) => (
            <div key={name} className="flex items-center gap-1.5 text-xs">
              <span className="text-xc-muted">{name}:</span>
              <span className="font-mono font-bold text-white">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Forecasts */}
      {forecasts.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-xc-muted uppercase tracking-wider mb-3">Asset Forecasts</div>
          {forecasts.map((fc) => {
            const sig = SIGNAL_CONFIG[fc.signal];
            const Icon = sig.icon;
            return (
              <div key={fc.symbol} className="flex items-center justify-between p-3.5 rounded-xl bg-xc-dark/40 border border-xc-border/60 hover:border-xc-border transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.03] flex items-center justify-center text-xs font-black text-white">
                    {fc.symbol[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{fc.symbol}</div>
                    <div className="text-xs text-xc-muted">{fc.horizon} horizon</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Return prediction */}
                  <div className="text-right">
                    <div className={cn('text-sm font-bold font-mono flex items-center gap-0.5', fc.expectedReturn >= 0 ? 'text-xc-green' : 'text-xc-red')}>
                      <Icon className="w-3.5 h-3.5" />
                      {fc.expectedReturn >= 0 ? '+' : ''}{formatPercent(fc.expectedReturn)}
                    </div>
                    <div className="text-xs text-xc-muted">→ {formatCurrency(fc.predictedPrice)}</div>
                  </div>

                  {/* Confidence */}
                  <div className="text-right text-xs">
                    <div className="text-white font-semibold">{fc.confidence}%</div>
                    <div className="text-xc-muted">conf.</div>
                  </div>

                  {/* Signal badge */}
                  <Badge variant={sig.variant} size="sm">{fc.signal}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-xc-muted/60 leading-relaxed">
        AI Oracle predictions are generated by machine learning models and do not constitute financial advice. Past performance of AI forecasts does not guarantee future accuracy. Always conduct your own research before investing.
      </p>
    </div>
  );
}
