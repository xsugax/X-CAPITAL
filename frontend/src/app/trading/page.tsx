'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AssetList from '@/components/trading/AssetList';
import OrderForm from '@/components/trading/OrderForm';
import { tradingAPI } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Zap, Flame, Activity, ArrowUpRight, ArrowDownRight,
  Radio, Target, BarChart3, Clock, Rocket, BrainCircuit, ShieldCheck, Volume2,
  Globe, Layers, LineChart,
} from 'lucide-react';
import type { Asset } from '@/types';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TRADING TERMINAL — Spaced out, charts everywhere, live data              */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function TradingPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [chartData, setChartData] = useState<Array<{ t: string; c: number; v: number }>>([]);
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M'>('1M');
  const [chartLoading, setChartLoading] = useState(false);
  const [liveFeed, setLiveFeed] = useState<LiveTrade[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData>(generateOrderBook(248.42));
  const [hotSignals, setHotSignals] = useState(HOT_SIGNALS);
  const [marketOverview, setMarketOverview] = useState(MARKET_SECTORS);
  const [heatmapData, setHeatmapData] = useState(HEATMAP_DATA);

  // Fetch chart on asset/period change
  useEffect(() => {
    if (!selectedAsset) return;
    const fetchChart = async () => {
      setChartLoading(true);
      try {
        const res = await tradingAPI.getAssetChart(selectedAsset.id, period);
        setChartData(res.data.data.bars ?? []);
      } catch {
        setChartData(generateMockBars(Number(selectedAsset.price), period));
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, [selectedAsset?.id, period]);

  // Live trade feed — every 1.2s
  useEffect(() => {
    const interval = setInterval(() => {
      const symbols = ['TSLA', 'NVDA', 'AAPL', 'BTC', 'ETH', 'DOGE', 'SpaceX', 'xAI', 'PLTR', 'META', 'AMZN', 'XSPACE', 'SOL', 'GOOGL', 'AMD', 'COIN', 'AVAX', 'XRP'];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const side = Math.random() > 0.42 ? 'BUY' : 'SELL';
      const price = Math.random() * 1000 + 10;
      const amount = Math.random() * 80000 + 500;
      const newTrade: LiveTrade = {
        id: Date.now().toString() + Math.random(),
        symbol: sym,
        side,
        price,
        amount,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };
      setLiveFeed((prev) => [newTrade, ...prev.slice(0, 29)]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Order book fluctuations — every 2.5s
  useEffect(() => {
    if (!selectedAsset) return;
    const interval = setInterval(() => {
      setOrderBook(generateOrderBook(Number(selectedAsset.price)));
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedAsset?.price]);

  // Hot signal countdown + confidence drift
  useEffect(() => {
    const interval = setInterval(() => {
      setHotSignals((prev) =>
        prev.map((s) => ({
          ...s,
          confidence: Math.min(99, Math.max(60, s.confidence + (Math.random() - 0.4) * 3)),
          countdown: Math.max(0, s.countdown - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Market sectors live drift
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketOverview((prev) =>
        prev.map((s) => ({
          ...s,
          change: s.change + (Math.random() - 0.48) * 0.15,
          value: s.value * (1 + (Math.random() - 0.48) * 0.001),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Heatmap live drift
  useEffect(() => {
    const interval = setInterval(() => {
      setHeatmapData((prev) =>
        prev.map((item) => ({
          ...item,
          change: item.change + (Math.random() - 0.48) * 0.12,
        }))
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const priceChange = chartData.length > 1
    ? ((chartData[chartData.length - 1].c - chartData[0].c) / chartData[0].c) * 100
    : 0;

  return (
    <DashboardLayout title="Trading Terminal" subtitle="Multi-rail execution · Real-time intelligence · 50,000+ assets">
      <div className="space-y-8">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 1 — Hot Signals Banner (full width)                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-amber-950/40 via-xc-card to-emerald-950/30 border border-amber-700/25 rounded-2xl p-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(217,119,6,0.08),transparent_50%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-900/60 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <span className="text-base font-black text-white">X-ORACLE HOT SIGNALS</span>
                <span className="text-[10px] font-mono text-amber-400 animate-pulse">● LIVE</span>
              </div>
              <div className="text-[10px] text-xc-muted">AI-generated · Not financial advice</div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
              {hotSignals.map((signal) => (
                <button
                  key={signal.symbol}
                  onClick={() => {
                    const asset = SIGNAL_ASSETS.find((a) => a.symbol === signal.symbol);
                    if (asset) setSelectedAsset(asset as Asset);
                  }}
                  className={cn(
                    'relative group p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]',
                    signal.side === 'BUY'
                      ? 'bg-emerald-950/40 border-emerald-700/30 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-red-950/40 border-red-700/30 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
                  )}
                >
                  {signal.countdown > 0 && signal.countdown < 300 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                      <span className="text-[9px] font-mono text-amber-400 animate-pulse">
                        {Math.floor(signal.countdown / 60)}:{String(signal.countdown % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-black text-white">{signal.symbol}</span>
                    <span className={cn(
                      'text-[9px] font-black px-1.5 py-0.5 rounded-full',
                      signal.side === 'BUY' ? 'bg-emerald-500/30 text-emerald-300 signal-flash-green' : 'bg-red-500/30 text-red-300',
                    )}>{signal.side}</span>
                  </div>
                  <div className={cn('text-xl font-black font-mono', signal.side === 'BUY' ? 'text-emerald-400' : 'text-red-400')}>
                    {signal.projection}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full mr-2 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', signal.side === 'BUY' ? 'bg-emerald-500' : 'bg-red-500')}
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-white/70">{signal.confidence.toFixed(0)}%</span>
                  </div>
                  <div className="text-[9px] text-xc-muted mt-2 leading-relaxed">{signal.reason}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 2 — Market Heatmap (full width)                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="font-black text-white text-base">Market Heatmap</h2>
            <span className="text-[10px] font-mono text-emerald-400 ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Real-time
            </span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
            {heatmapData.map((item) => {
              const intensity = Math.min(1, Math.abs(item.change) / 8);
              const bg = item.change >= 0
                ? `rgba(16, 185, 129, ${0.1 + intensity * 0.4})`
                : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`;
              return (
                <button
                  key={item.symbol}
                  onClick={() => {
                    const a = SIGNAL_ASSETS.find((sa) => sa.symbol === item.symbol);
                    if (a) setSelectedAsset(a as Asset);
                  }}
                  className="p-3 rounded-xl border border-white/5 transition-all hover:scale-105 hover:border-white/20 text-center"
                  style={{ background: bg }}
                >
                  <div className="text-xs font-black text-white">{item.symbol}</div>
                  <div className={cn('text-sm font-black font-mono mt-1', item.change >= 0 ? 'text-emerald-300' : 'text-red-300')}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                  </div>
                  <div className="text-[8px] text-white/50 mt-0.5">{item.cap}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 3 — Main Trading Grid (spaced out, tall)                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-[340px_1fr_340px] gap-6">

          {/* ── Left: Markets List ──────────────────────────────── */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-5 flex flex-col" style={{ minHeight: 700 }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-xc-purple-light" />
              <h2 className="font-bold text-white text-sm">All Markets</h2>
              <span className="ml-auto text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <AssetList onSelect={setSelectedAsset} selectedSymbol={selectedAsset?.symbol} />
            </div>
          </div>

          {/* ── Center: Chart + Volume ─────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Price Chart */}
            <div className="bg-xc-card border border-xc-border rounded-2xl p-6 relative" style={{ minHeight: 480 }}>
              {selectedAsset ? (
                <>
                  <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                    <div className={cn(
                      'absolute inset-0 opacity-0 transition-opacity duration-300',
                      priceChange >= 0 ? 'chart-flash-green' : 'chart-flash-red'
                    )} />
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10 flex items-center justify-center text-xl font-black text-white">
                          {selectedAsset.symbol[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-white">{selectedAsset.symbol}</h2>
                            <Badge variant={selectedAsset.type === 'STOCK' ? 'default' : selectedAsset.type === 'TOKEN' ? 'purple' : 'info'}>
                              {selectedAsset.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-xc-muted">{selectedAsset.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black font-mono text-white price-shimmer">
                        {formatCurrency(Number(selectedAsset.price))}
                      </div>
                      <div className={cn('text-base font-bold flex items-center justify-end gap-1', priceChange >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {priceChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        <span className="text-xs text-xc-muted ml-1">({period})</span>
                      </div>
                    </div>
                  </div>

                  {/* Period tabs + volume */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {(['1D', '1W', '1M', '3M'] as const).map((p) => (
                        <button key={p} onClick={() => setPeriod(p)}
                          className={cn('px-4 py-2 rounded-lg text-sm font-bold transition-all',
                            period === p ? 'bg-xc-purple text-white glow-purple' : 'text-xc-muted hover:text-white hover:bg-white/5'
                          )}>
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-xc-muted">
                      <span>Vol 24h: <span className="text-white font-mono">{formatCurrency(Math.random() * 5e9 + 1e8)}</span></span>
                      <span>Mkt Cap: <span className="text-white font-mono">{formatCurrency(Number(selectedAsset.price) * (Math.random() * 5e9 + 1e8))}</span></span>
                    </div>
                  </div>

                  {/* Chart */}
                  <div style={{ height: 280 }}>
                    {chartLoading ? (
                      <div className="h-full w-full rounded-xl bg-xc-dark/60 animate-pulse" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} domain={['auto', 'auto']} />
                          <Tooltip
                            contentStyle={{ background: '#0d0d1e', border: '1px solid #1a1a3a', borderRadius: 8, fontSize: 12 }}
                            formatter={(v: number, name: string) => [name === 'c' ? formatCurrency(v) : formatCurrency(v), name === 'c' ? 'Price' : 'Volume']}
                            labelStyle={{ color: '#64748b' }}
                          />
                          <Area type="monotone" dataKey="c" stroke={priceChange >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2.5} fill="url(#chartGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Quick stats bar */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
                    {[
                      { label: 'Open', value: formatCurrency(Number(selectedAsset.price) * 0.985) },
                      { label: 'High', value: formatCurrency(Number(selectedAsset.price) * 1.032) },
                      { label: 'Low', value: formatCurrency(Number(selectedAsset.price) * 0.971) },
                      { label: 'Prev Close', value: formatCurrency(Number(selectedAsset.price) * 0.994) },
                      { label: 'Avg Volume', value: '42.8M' },
                      { label: 'Spread', value: '0.02%' },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <div className="text-[9px] text-xc-muted uppercase">{label}</div>
                        <div className="text-xs font-mono font-bold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center mb-6 animate-pulse">
                    <Rocket className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-white font-black text-xl mb-3">Select an Asset to Trade</h3>
                  <p className="text-xc-muted text-sm max-w-md mb-6">
                    Choose from 50,000+ assets across stocks, ETFs, crypto, private tokens, commodities, and SPVs.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_PICKS.map((pick) => (
                      <button
                        key={pick.symbol}
                        onClick={() => setSelectedAsset(pick as Asset)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-950/30 hover:border-purple-500/30 transition-all text-sm"
                      >
                        <span className="font-bold text-white">{pick.symbol}</span>
                        <span className={cn('ml-2 text-xs font-mono', Number(pick.priceChange24h) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {Number(pick.priceChange24h) >= 0 ? '+' : ''}{Number(pick.priceChange24h).toFixed(1)}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Volume Chart */}
            {selectedAsset && (
              <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">Volume Analysis</h3>
                  <span className="text-[10px] text-xc-muted ml-auto">{selectedAsset.symbol} · {period}</span>
                </div>
                <div style={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                      <Tooltip
                        contentStyle={{ background: '#0d0d1e', border: '1px solid #1a1a3a', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: number) => [formatCurrency(v), 'Volume']}
                      />
                      <Bar dataKey="v" fill="#7c3aed" opacity={0.6} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Form + Profit Calc ────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Order Form */}
            <div className="bg-xc-card border border-xc-border rounded-2xl p-6 relative">
              {selectedAsset && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
              )}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <Target className="w-4 h-4 text-xc-purple-light" />
                  <h2 className="font-bold text-white text-sm">Place Order</h2>
                </div>
                <OrderForm asset={selectedAsset} />
              </div>
            </div>

            {/* Profit Projections */}
            {selectedAsset && (
              <div className="bg-gradient-to-b from-emerald-950/30 to-xc-card border border-emerald-800/25 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Profit Projections</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'If +10%', multiplier: 1.1, period: '7D avg' },
                    { label: 'If +25%', multiplier: 1.25, period: '30D target' },
                    { label: 'If +100%', multiplier: 2.0, period: '12M bull' },
                    { label: 'If +500%', multiplier: 6.0, period: 'SpaceX IPO' },
                  ].map(({ label, multiplier, period }) => {
                    const invested = 10000;
                    const profit = invested * (multiplier - 1);
                    return (
                      <div key={label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
                        <div>
                          <div className="text-xs font-bold text-white">{label}</div>
                          <div className="text-[9px] text-xc-muted">{period}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black font-mono text-emerald-400 profit-glow">
                            +{formatCurrency(profit)}
                          </div>
                          <div className="text-[9px] text-xc-muted">on $10k</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Insight */}
                <div className="mt-4 p-3 rounded-lg bg-amber-950/20 border border-amber-700/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400">X-ORACLE INSIGHT</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    {selectedAsset.symbol} is trading{' '}
                    {Number(selectedAsset.priceChange24h ?? 0) >= 0 ? 'above' : 'below'}{' '}
                    its 20-day SMA with {Number(selectedAsset.priceChange24h ?? 0) >= 0 ? 'bullish' : 'bearish'}{' '}
                    momentum. AI confidence:{' '}
                    <span className="text-emerald-400 font-bold">{(75 + Math.random() * 20).toFixed(0)}%</span>
                  </p>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="bg-xc-card border border-xc-border rounded-2xl p-4">
              <div className="flex items-center justify-around text-center">
                {[
                  { icon: ShieldCheck, label: 'SEC Compliant', color: 'text-emerald-400' },
                  { icon: Zap, label: '<1ms Exec', color: 'text-cyan-400' },
                  { icon: Volume2, label: '$2.4T Volume', color: 'text-purple-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <Icon className={cn('w-4 h-4', color)} />
                    <span className="text-[9px] text-xc-muted font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 4 — Order Book + Live Trades (full width, side by side) */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Order Book */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Order Book</h3>
              <span className="text-[10px] text-xc-muted font-mono ml-auto">
                {selectedAsset ? selectedAsset.symbol : 'Select asset'} · Depth L2
              </span>
            </div>
            {selectedAsset ? (
              <div className="grid grid-cols-2 gap-6">
                {/* Bids */}
                <div>
                  <div className="flex justify-between text-[9px] text-xc-muted mb-3 uppercase font-bold">
                    <span>Bid Price</span><span>Size</span><span>Total</span>
                  </div>
                  <div className="space-y-1">
                    {orderBook.bids.map((bid, i) => {
                      const cumSize = orderBook.bids.slice(0, i + 1).reduce((s, b) => s + b.size, 0);
                      return (
                        <div key={i} className="flex justify-between text-xs relative py-1">
                          <div className="absolute inset-0 bg-emerald-500/8 rounded" style={{ width: `${bid.depth}%` }} />
                          <span className="font-mono text-emerald-400 relative z-10">${bid.price.toFixed(2)}</span>
                          <span className="font-mono text-white/70 relative z-10">{bid.size.toFixed(2)}</span>
                          <span className="font-mono text-white/40 relative z-10">{cumSize.toFixed(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Asks */}
                <div>
                  <div className="flex justify-between text-[9px] text-xc-muted mb-3 uppercase font-bold">
                    <span>Ask Price</span><span>Size</span><span>Total</span>
                  </div>
                  <div className="space-y-1">
                    {orderBook.asks.map((ask, i) => {
                      const cumSize = orderBook.asks.slice(0, i + 1).reduce((s, a) => s + a.size, 0);
                      return (
                        <div key={i} className="flex justify-between text-xs relative py-1">
                          <div className="absolute inset-0 bg-red-500/8 rounded" style={{ width: `${ask.depth}%` }} />
                          <span className="font-mono text-red-400 relative z-10">${ask.price.toFixed(2)}</span>
                          <span className="font-mono text-white/70 relative z-10">{ask.size.toFixed(2)}</span>
                          <span className="font-mono text-white/40 relative z-10">{cumSize.toFixed(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xc-muted text-sm">Select an asset to view order book depth</div>
            )}
          </div>

          {/* Live Trades Feed */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-bold text-white text-base">Live Trades</h3>
              <span className="text-[10px] font-mono text-emerald-400 ml-auto">Streaming · All markets</span>
            </div>
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 gap-y-1 text-xs">
              {/* Header */}
              <span className="text-[9px] text-xc-muted font-bold uppercase pb-2">Side</span>
              <span className="text-[9px] text-xc-muted font-bold uppercase pb-2">Asset</span>
              <span className="text-[9px] text-xc-muted font-bold uppercase pb-2 text-right">Price</span>
              <span className="text-[9px] text-xc-muted font-bold uppercase pb-2 text-right">Amount</span>
              <span className="text-[9px] text-xc-muted font-bold uppercase pb-2 text-right">Time</span>

              {liveFeed.slice(0, 15).map((trade, i) => (
                <div key={trade.id} className={cn('contents', i === 0 ? 'trade-flash' : '')}>
                  <span className={cn('font-bold py-1', trade.side === 'BUY' ? 'text-emerald-400' : 'text-red-400')}>
                    {trade.side}
                  </span>
                  <span className="font-bold text-white py-1">{trade.symbol}</span>
                  <span className="font-mono text-white/70 py-1 text-right">${trade.price.toFixed(2)}</span>
                  <span className="font-mono text-white/80 py-1 text-right">{formatCurrency(trade.amount)}</span>
                  <span className="text-xc-muted font-mono py-1 text-right">{trade.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 5 — Market Sectors (full width bar charts)              */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <LineChart className="w-5 h-5 text-purple-400" />
            <h2 className="font-black text-white text-base">Sector Performance</h2>
            <span className="text-[10px] text-xc-muted ml-auto">Live · Updated every 3s</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {marketOverview.map((sector) => (
              <div key={sector.name} className="bg-xc-dark/40 border border-xc-border/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">{sector.name}</span>
                  <span className={cn('text-xs font-bold font-mono', sector.change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                  </span>
                </div>
                {/* Mini area chart per sector */}
                <div style={{ height: 60 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sector.data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                      <defs>
                        <linearGradient id={`sg-${sector.name}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={sector.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={sector.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={sector.change >= 0 ? '#10b981' : '#ef4444'} strokeWidth={1.5} fill={`url(#sg-${sector.name})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-xc-muted">
                  <span>{sector.assets} assets</span>
                  <span className="font-mono">{formatCurrency(sector.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 6 — Top Movers (full width)                             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Top Gainers</h3>
              <span className="text-[10px] text-xc-muted ml-auto">24h</span>
            </div>
            <div className="space-y-3">
              {TOP_GAINERS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset as Asset)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl bg-emerald-950/10 border border-emerald-800/20 hover:border-emerald-600/40 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-900/40 flex items-center justify-center text-sm font-black text-emerald-400">
                    {asset.symbol[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{asset.symbol}</div>
                    <div className="text-xs text-xc-muted">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">{formatCurrency(Number(asset.price))}</div>
                    <div className="text-sm font-black text-emerald-400">+{Number(asset.priceChange24h).toFixed(2)}%</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-white text-base">Top Losers</h3>
              <span className="text-[10px] text-xc-muted ml-auto">24h</span>
            </div>
            <div className="space-y-3">
              {TOP_LOSERS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset as Asset)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl bg-red-950/10 border border-red-800/20 hover:border-red-600/40 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center text-sm font-black text-red-400">
                    {asset.symbol[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{asset.symbol}</div>
                    <div className="text-xs text-xc-muted">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">{formatCurrency(Number(asset.price))}</div>
                    <div className="text-sm font-black text-red-400">{Number(asset.priceChange24h).toFixed(2)}%</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveTrade { id: string; symbol: string; side: 'BUY' | 'SELL'; price: number; amount: number; time: string; }
interface OrderBookEntry { price: number; size: number; depth: number; }
interface OrderBookData { bids: OrderBookEntry[]; asks: OrderBookEntry[]; }

// ─── Generators ───────────────────────────────────────────────────────────────
function generateOrderBook(basePrice: number): OrderBookData {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  for (let i = 0; i < 10; i++) {
    bids.push({ price: basePrice - (i + 1) * (basePrice * 0.001 + Math.random() * basePrice * 0.002), size: Math.random() * 500 + 10, depth: Math.random() * 80 + 20 });
    asks.push({ price: basePrice + (i + 1) * (basePrice * 0.001 + Math.random() * basePrice * 0.002), size: Math.random() * 500 + 10, depth: Math.random() * 80 + 20 });
  }
  return { bids, asks };
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
    data.push({
      t: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      c: Math.round(price * 100) / 100,
      v: Math.round(Math.random() * 80e6 + 20e6),
    });
  }
  return data;
}

function generateSectorData() {
  const data = [];
  let v = 100;
  for (let i = 0; i < 20; i++) {
    v *= 1 + (Math.random() - 0.47) * 0.03;
    data.push({ v: Math.round(v * 100) / 100 });
  }
  return data;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const HOT_SIGNALS = [
  { symbol: 'TSLA', side: 'BUY' as const, projection: '+18.4%', confidence: 92, reason: 'Q1 deliveries beat · Robotaxi launch Q3', countdown: 247 },
  { symbol: 'SpaceX', side: 'BUY' as const, projection: '+32.1%', confidence: 88, reason: 'Starship Flight 12 · Starlink 5M subs', countdown: 180 },
  { symbol: 'NVDA', side: 'BUY' as const, projection: '+24.2%', confidence: 94, reason: 'B200 ramp · 2x demand vs supply', countdown: 312 },
  { symbol: 'DOGE', side: 'BUY' as const, projection: '+44.7%', confidence: 71, reason: 'X Payments integration rumor', countdown: 125 },
  { symbol: 'SOL', side: 'BUY' as const, projection: '+28.3%', confidence: 82, reason: 'Firedancer mainnet · DeFi TVL ATH', countdown: 198 },
  { symbol: 'AMD', side: 'BUY' as const, projection: '+16.8%', confidence: 79, reason: 'MI400 launch · hyperscaler wins', countdown: 267 },
  { symbol: 'COIN', side: 'BUY' as const, projection: '+22.5%', confidence: 85, reason: 'ETF inflows record · staking revenue', countdown: 154 },
  { symbol: 'XAI', side: 'BUY' as const, projection: '+55.2%', confidence: 76, reason: 'Grok-4 benchmark · pre-IPO round', countdown: 89 },
];

const SIGNAL_ASSETS = [
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla, Inc.', type: 'STOCK', price: 342.18, priceChange24h: 3.12 },
  { id: 'spacex', symbol: 'SpaceX', name: 'Space Exploration Technologies', type: 'TOKEN', price: 252.00, priceChange24h: 6.84 },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'STOCK', price: 875.39, priceChange24h: 2.41 },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', type: 'CRYPTO', price: 0.4217, priceChange24h: 8.52 },
  { id: 'sol', symbol: 'SOL', name: 'Solana', type: 'CRYPTO', price: 187.63, priceChange24h: 5.17 },
  { id: 'amd', symbol: 'AMD', name: 'Advanced Micro Devices', type: 'STOCK', price: 164.78, priceChange24h: 3.47 },
  { id: 'coin', symbol: 'COIN', name: 'Coinbase Global', type: 'STOCK', price: 267.12, priceChange24h: 5.84 },
  { id: 'xai', symbol: 'XAI', name: 'xAI Venture Token', type: 'TOKEN', price: 180.00, priceChange24h: 12.40 },
];

const QUICK_PICKS = [
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla, Inc.', type: 'STOCK', price: 342.18, priceChange24h: 3.12 },
  { id: 'spacex', symbol: 'SpaceX', name: 'SpaceX', type: 'TOKEN', price: 252.00, priceChange24h: 6.84 },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA', type: 'STOCK', price: 875.39, priceChange24h: 2.41 },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', price: 97842.50, priceChange24h: -1.23 },
  { id: 'sol', symbol: 'SOL', name: 'Solana', type: 'CRYPTO', price: 187.63, priceChange24h: 5.17 },
  { id: 'xai', symbol: 'XAI', name: 'xAI', type: 'TOKEN', price: 180.00, priceChange24h: 12.40 },
];

const HEATMAP_DATA = [
  { symbol: 'TSLA', change: 3.21, cap: '$1.08T' },
  { symbol: 'NVDA', change: 2.15, cap: '$2.18T' },
  { symbol: 'AAPL', change: 0.54, cap: '$3.42T' },
  { symbol: 'META', change: 2.77, cap: '$1.31T' },
  { symbol: 'AMZN', change: -0.82, cap: '$2.01T' },
  { symbol: 'MSFT', change: 1.04, cap: '$3.12T' },
  { symbol: 'GOOGL', change: -0.14, cap: '$2.21T' },
  { symbol: 'BTC', change: -1.23, cap: '$1.92T' },
  { symbol: 'ETH', change: 2.64, cap: '$462B' },
  { symbol: 'SOL', change: 5.17, cap: '$84B' },
  { symbol: 'DOGE', change: 8.52, cap: '$58B' },
  { symbol: 'AMD', change: 3.47, cap: '$267B' },
  { symbol: 'PLTR', change: 4.55, cap: '$54B' },
  { symbol: 'COIN', change: 5.84, cap: '$67B' },
  { symbol: 'SpaceX', change: 6.84, cap: '$350B' },
  { symbol: 'XAI', change: 12.40, cap: '$45B' },
  { symbol: 'NFLX', change: -1.08, cap: '$278B' },
  { symbol: 'CRM', change: 1.23, cap: '$263B' },
  { symbol: 'UBER', change: 2.31, cap: '$162B' },
  { symbol: 'SNAP', change: -2.41, cap: '$23B' },
  { symbol: 'XRP', change: 4.22, cap: '$118B' },
  { symbol: 'AVAX', change: 3.18, cap: '$15B' },
  { symbol: 'LINK', change: 1.56, cap: '$11B' },
  { symbol: 'ARKK', change: 1.33, cap: '$6.2B' },
];

const MARKET_SECTORS = [
  { name: 'Technology', change: 2.34, value: 14.2e12, assets: 842, data: generateSectorData() },
  { name: 'Crypto', change: 3.87, value: 2.8e12, assets: 12400, data: generateSectorData() },
  { name: 'Space', change: 5.12, value: 890e9, assets: 127, data: generateSectorData() },
  { name: 'AI / ML', change: 4.22, value: 3.4e12, assets: 312, data: generateSectorData() },
  { name: 'Energy', change: -0.87, value: 5.1e12, assets: 524, data: generateSectorData() },
  { name: 'Commodities', change: 0.42, value: 1.2e12, assets: 86, data: generateSectorData() },
  { name: 'Healthcare', change: 1.15, value: 6.8e12, assets: 1240, data: generateSectorData() },
  { name: 'Finance', change: -0.34, value: 8.2e12, assets: 892, data: generateSectorData() },
  { name: 'EV / Auto', change: 3.18, value: 2.1e12, assets: 214, data: generateSectorData() },
  { name: 'DeFi', change: 6.42, value: 180e9, assets: 3400, data: generateSectorData() },
  { name: 'Gaming', change: 1.87, value: 420e9, assets: 156, data: generateSectorData() },
  { name: 'Private Equity', change: 2.08, value: 1.4e12, assets: 48, data: generateSectorData() },
];

const TOP_GAINERS = [
  { id: 'xai', symbol: 'XAI', name: 'xAI Venture Token', type: 'TOKEN', price: 180.00, priceChange24h: 12.40 },
  { id: 'xdoge', symbol: 'XDOGE', name: 'X-DOGE Meme Economy', type: 'FUND', price: 24.67, priceChange24h: 11.32 },
  { id: 'xneura', symbol: 'XNEURA', name: 'Neuralink BCI Token', type: 'TOKEN', price: 48.50, priceChange24h: 9.80 },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', type: 'CRYPTO', price: 0.4217, priceChange24h: 8.52 },
  { id: 'xoptimus', symbol: 'XOPTIMUS', name: 'Tesla Optimus Token', type: 'TOKEN', price: 67.30, priceChange24h: 7.12 },
];

const TOP_LOSERS = [
  { id: 'snap', symbol: 'SNAP', name: 'Snap Inc.', type: 'STOCK', price: 14.23, priceChange24h: -2.41 },
  { id: 'dot', symbol: 'DOT', name: 'Polkadot', type: 'CRYPTO', price: 7.84, priceChange24h: -1.89 },
  { id: 'xenergy', symbol: 'XENERGY', name: 'X-ENERGY Green Grid', type: 'TOKEN', price: 6.20, priceChange24h: -1.45 },
  { id: 'ibit', symbol: 'IBIT', name: 'iShares Bitcoin Trust', type: 'ETF', price: 52.89, priceChange24h: -1.34 },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', price: 97842.50, priceChange24h: -1.23 },
];
