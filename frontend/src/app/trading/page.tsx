'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AssetList from '@/components/trading/AssetList';
import OrderForm from '@/components/trading/OrderForm';
import { tradingAPI } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { Asset } from '@/types';

export default function TradingPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [chartData, setChartData] = useState<Array<{ t: string; c: number }>>([]);
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M'>('1M');
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!selectedAsset) return;
    const fetchChart = async () => {
      setChartLoading(true);
      try {
        const res = await tradingAPI.getAssetChart(selectedAsset.id, period);
        setChartData(res.data.data.bars ?? []);
      } catch {
        // Generate mock data
        setChartData(generateMockBars(Number(selectedAsset.price), period));
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, [selectedAsset?.id, period]);

  const priceChange = chartData.length > 1
    ? ((chartData[chartData.length - 1].c - chartData[0].c) / chartData[0].c) * 100
    : 0;

  return (
    <DashboardLayout title="Trading" subtitle="Multi-rail order execution">
      <div className="grid lg:grid-cols-[340px_1fr_320px] gap-5 h-[calc(100vh-140px)]">

        {/* ── Asset List ──────────────────────────────────────────────────── */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-5 flex flex-col overflow-hidden">
          <h2 className="font-bold text-white mb-4">Markets</h2>
          <div className="flex-1 overflow-hidden">
            <AssetList onSelect={setSelectedAsset} selectedSymbol={selectedAsset?.symbol} />
          </div>
        </div>

        {/* ── Chart area ──────────────────────────────────────────────────── */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-6 flex flex-col overflow-hidden">
          {selectedAsset ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-white">{selectedAsset.symbol}</h2>
                    <Badge variant={selectedAsset.type === 'STOCK' ? 'default' : selectedAsset.type === 'TOKEN' ? 'purple' : 'info'}>
                      {selectedAsset.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-xc-muted mt-0.5">{selectedAsset.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-white">{formatCurrency(Number(selectedAsset.price))}</div>
                  <div className={cn('text-sm font-bold', priceChange >= 0 ? 'text-xc-green' : 'text-xc-red')}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Period tabs */}
              <div className="flex gap-1 mb-4">
                {(['1D', '1W', '1M', '3M'] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={cn('px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                      period === p ? 'bg-xc-purple text-white' : 'text-xc-muted hover:text-white hover:bg-white/5'
                    )}>
                    {p}
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="flex-1 min-h-0">
                {chartLoading ? (
                  <div className="h-full w-full rounded-xl bg-xc-dark/60 animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ background: '#0d0d1e', border: '1px solid #1a1a3a', borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [formatCurrency(v), 'Price']}
                        labelStyle={{ color: '#64748b' }}
                      />
                      <Area type="monotone" dataKey="c" stroke={priceChange >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2} fill="url(#chartGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4 opacity-30">📈</div>
              <h3 className="text-white font-bold mb-2">Select an Asset</h3>
              <p className="text-xc-muted text-sm max-w-xs">
                Choose from 10,000+ assets across stocks, ETFs, tokens, and more via the list on the left.
              </p>
            </div>
          )}
        </div>

        {/* ── Order Form ──────────────────────────────────────────────────── */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-6 overflow-y-auto custom-scrollbar">
          <h2 className="font-bold text-white mb-5">Place Order</h2>
          <OrderForm asset={selectedAsset} />
        </div>
      </div>
    </DashboardLayout>
  );
}

function generateMockBars(basePrice: number, period: string) {
  const count = period === '1D' ? 24 : period === '1W' ? 7 : period === '1M' ? 30 : 90;
  const data = [];
  let price = basePrice * (1 - 0.15 * Math.random());
  const now = new Date();
  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    if (period === '1D') d.setHours(d.getHours() - i);
    else d.setDate(d.getDate() - i);
    price *= 1 + (Math.random() - 0.47) * 0.03;
    data.push({ t: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), c: Math.round(price * 100) / 100 });
  }
  return data;
}
