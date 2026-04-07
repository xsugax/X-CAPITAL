'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AssetList from '@/components/trading/AssetList';
import OrderForm from '@/components/trading/OrderForm';
import { tradingAPI } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Zap, Flame, Activity, ArrowUpRight, ArrowDownRight,
  Radio, Target, BarChart3, Clock, Rocket, BrainCircuit, ShieldCheck, Volume2,
} from 'lucide-react';
import type { Asset } from '@/types';

export default function TradingPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [chartData, setChartData] = useState<Array<{ t: string; c: number }>>([]);
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M'>('1M');
  const [chartLoading, setChartLoading] = useState(false);
  const [liveFeed, setLiveFeed] = useState<LiveTrade[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData>(generateOrderBook(248.42));
  const [hotSignals, setHotSignals] = useState(HOT_SIGNALS);

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

  // Simulate live trade feed
  useEffect(() => {
    const interval = setInterval(() => {
      const symbols = ['TSLA', 'NVDA', 'AAPL', 'BTC', 'ETH', 'DOGE', 'SpaceX', 'xAI', 'PLTR', 'META', 'AMZN', 'XSPACE'];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const side = Math.random() > 0.45 ? 'BUY' : 'SELL';
      const price = Math.random() * 1000 + 10;
      const amount = Math.random() * 50000 + 500;
      const newTrade: LiveTrade = {
        id: Date.now().toString(),
        symbol: sym,
        side,
        price,
        amount,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };
      setLiveFeed((prev) => [newTrade, ...prev.slice(0, 19)]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Simulate order book fluctuations
  useEffect(() => {
    if (!selectedAsset) return;
    const interval = setInterval(() => {
      setOrderBook(generateOrderBook(Number(selectedAsset.price)));
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedAsset?.price]);

  // Rotate hot signal urgency
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

  const priceChange = chartData.length > 1
    ? ((chartData[chartData.length - 1].c - chartData[0].c) / chartData[0].c) * 100
    : 0;

  return (
    <DashboardLayout title="Trading Terminal" subtitle="Multi-rail execution · Real-time intelligence">
      <div className="space-y-4">
        {/* ── Hot Signals Banner ──────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-amber-950/40 via-xc-card to-emerald-950/30 border border-amber-700/25 rounded-2xl p-4 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(217,119,6,0.08),transparent_50%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-900/60 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div>
                <span className="text-sm font-black text-white">X-ORACLE HOT SIGNALS</span>
                <span className="text-[10px] font-mono text-amber-400 animate-pulse">● LIVE</span>
              </div>
              <div className="text-[10px] text-xc-muted">AI-generated · Not financial advice</div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {hotSignals.map((signal) => (
                <button
                  key={signal.symbol}
                  onClick={() => {
                    const asset = SIGNAL_ASSETS.find((a) => a.symbol === signal.symbol);
                    if (asset) setSelectedAsset(asset as Asset);
                  }}
                  className={cn(
                    'relative group p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]',
                    signal.side === 'BUY'
                      ? 'bg-emerald-950/40 border-emerald-700/30 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-red-950/40 border-red-700/30 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
                  )}
                >
                  {/* Urgency countdown */}
                  {signal.countdown > 0 && signal.countdown < 300 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                      <span className="text-[9px] font-mono text-amber-400 animate-pulse">
                        {Math.floor(signal.countdown / 60)}:{String(signal.countdown % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-black text-white">{signal.symbol}</span>
                    <span className={cn(
                      'text-[9px] font-black px-1.5 py-0.5 rounded-full',
                      signal.side === 'BUY'
                        ? 'bg-emerald-500/30 text-emerald-300 signal-flash-green'
                        : 'bg-red-500/30 text-red-300',
                    )}>
                      {signal.side}
                    </span>
                  </div>
                  <div className={cn('text-xl font-black font-mono', signal.side === 'BUY' ? 'text-emerald-400' : 'text-red-400')}>
                    {signal.projection}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="h-1 flex-1 bg-white/10 rounded-full mr-2 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', signal.side === 'BUY' ? 'bg-emerald-500' : 'bg-red-500')}
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-white/70">{signal.confidence.toFixed(0)}%</span>
                  </div>
                  <div className="text-[9px] text-xc-muted mt-1">{signal.reason}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Terminal Grid ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[300px_1fr_300px] gap-4 h-[calc(100vh-320px)] min-h-[500px]">

          {/* ── Left Panel: Markets + Order Book ──────────────────────── */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Markets */}
            <div className="bg-xc-card border border-xc-border rounded-2xl p-4 flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-xc-purple-light" />
                <h2 className="font-bold text-white text-sm">Markets</h2>
                <span className="ml-auto text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <AssetList onSelect={setSelectedAsset} selectedSymbol={selectedAsset?.symbol} />
              </div>
            </div>

            {/* Order Book */}
            {selectedAsset && (
              <div className="bg-xc-card border border-xc-border rounded-2xl p-4 h-[240px] shrink-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Order Book</span>
                  <span className="text-[9px] text-xc-muted font-mono ml-auto">{selectedAsset.symbol}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 h-[calc(100%-28px)]">
                  {/* Bids */}
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex justify-between text-[8px] text-xc-muted mb-1">
                      <span>PRICE</span><span>SIZE</span>
                    </div>
                    {orderBook.bids.map((bid, i) => (
                      <div key={i} className="flex justify-between text-[10px] relative">
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-sm" style={{ width: `${bid.depth}%` }} />
                        <span className="font-mono text-emerald-400 relative z-10">{bid.price.toFixed(2)}</span>
                        <span className="font-mono text-white/70 relative z-10">{bid.size.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {/* Asks */}
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex justify-between text-[8px] text-xc-muted mb-1">
                      <span>PRICE</span><span>SIZE</span>
                    </div>
                    {orderBook.asks.map((ask, i) => (
                      <div key={i} className="flex justify-between text-[10px] relative">
                        <div className="absolute inset-0 bg-red-500/10 rounded-sm" style={{ width: `${ask.depth}%` }} />
                        <span className="font-mono text-red-400 relative z-10">{ask.price.toFixed(2)}</span>
                        <span className="font-mono text-white/70 relative z-10">{ask.size.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Center: Chart + Live Trades ───────────────────────────── */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Chart */}
            <div className="bg-xc-card border border-xc-border rounded-2xl p-5 flex flex-col flex-1 overflow-hidden relative">
              {selectedAsset ? (
                <>
                  {/* Price flash overlay */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                    <div className={cn(
                      'absolute inset-0 opacity-0 transition-opacity duration-300',
                      priceChange >= 0 ? 'chart-flash-green' : 'chart-flash-red'
                    )} />
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10 flex items-center justify-center text-lg font-black text-white">
                          {selectedAsset.symbol[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-white">{selectedAsset.symbol}</h2>
                            <Badge variant={selectedAsset.type === 'STOCK' ? 'default' : selectedAsset.type === 'TOKEN' ? 'purple' : 'info'}>
                              {selectedAsset.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-xc-muted">{selectedAsset.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black font-mono text-white price-shimmer">
                        {formatCurrency(Number(selectedAsset.price))}
                      </div>
                      <div className={cn('text-sm font-bold flex items-center justify-end gap-1', priceChange >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        <span className="text-[10px] text-xc-muted ml-1">({period})</span>
                      </div>
                    </div>
                  </div>

                  {/* Period tabs + volume */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1">
                      {(['1D', '1W', '1M', '3M'] as const).map((p) => (
                        <button key={p} onClick={() => setPeriod(p)}
                          className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                            period === p ? 'bg-xc-purple text-white glow-purple' : 'text-xc-muted hover:text-white hover:bg-white/5'
                          )}>
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-xc-muted">
                      <span>Vol 24h: <span className="text-white font-mono">{formatCurrency(Math.random() * 5e9 + 1e8)}</span></span>
                      <span>Mkt Cap: <span className="text-white font-mono">{formatCurrency(Number(selectedAsset.price) * (Math.random() * 5e9 + 1e8))}</span></span>
                    </div>
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
                              <stop offset="5%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
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
                          <Area type="monotone" dataKey="c" stroke={priceChange >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2.5} fill="url(#chartGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Quick stats bar */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                    {[
                      { label: 'Open', value: formatCurrency(Number(selectedAsset.price) * 0.985) },
                      { label: 'High', value: formatCurrency(Number(selectedAsset.price) * 1.032) },
                      { label: 'Low', value: formatCurrency(Number(selectedAsset.price) * 0.971) },
                      { label: 'Prev Close', value: formatCurrency(Number(selectedAsset.price) * 0.994) },
                      { label: 'Spread', value: '0.02%' },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <div className="text-[9px] text-xc-muted uppercase">{label}</div>
                        <div className="text-[11px] font-mono font-bold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center mb-4 animate-pulse">
                    <Rocket className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-white font-black text-lg mb-2">Select an Asset to Trade</h3>
                  <p className="text-xc-muted text-sm max-w-xs mb-5">
                    Choose from 50,000+ assets across stocks, ETFs, crypto, private tokens, and SPVs.
                  </p>
                  <div className="flex gap-2">
                    {QUICK_PICKS.map((pick) => (
                      <button
                        key={pick.symbol}
                        onClick={() => setSelectedAsset(pick as Asset)}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-950/30 hover:border-purple-500/30 transition-all text-sm"
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

            {/* Live Trades Feed */}
            <div className="bg-xc-card border border-xc-border rounded-2xl p-4 h-[160px] shrink-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Live Trades</span>
                <span className="text-[9px] font-mono text-emerald-400 ml-auto">Streaming</span>
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {liveFeed.slice(0, 6).map((trade, i) => (
                  <div
                    key={trade.id}
                    className={cn(
                      'flex items-center justify-between text-[10px] py-1 px-2 rounded-lg transition-all',
                      i === 0 ? 'trade-flash' : '',
                      trade.side === 'BUY' ? 'bg-emerald-950/20' : 'bg-red-950/20',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn('font-bold', trade.side === 'BUY' ? 'text-emerald-400' : 'text-red-400')}>
                        {trade.side}
                      </span>
                      <span className="font-bold text-white">{trade.symbol}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white/80">{formatCurrency(trade.amount)}</span>
                      <span className="text-xc-muted font-mono">{trade.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Order Form + Profit Calculator ──────────── */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Order Form */}
            <div className="bg-xc-card border border-xc-border rounded-2xl p-5 flex-1 overflow-y-auto custom-scrollbar relative">
              {/* Glow effect when asset selected */}
              {selectedAsset && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
              )}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-xc-purple-light" />
                  <h2 className="font-bold text-white text-sm">Place Order</h2>
                </div>
                <OrderForm asset={selectedAsset} />
              </div>
            </div>

            {/* Profit Calculator */}
            {selectedAsset && (
              <div className="bg-gradient-to-b from-emerald-950/30 to-xc-card border border-emerald-800/25 rounded-2xl p-4 shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Profit Projections</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'If +10%', multiplier: 1.1, period: '7D avg' },
                    { label: 'If +25%', multiplier: 1.25, period: '30D target' },
                    { label: 'If +100%', multiplier: 2.0, period: '12M bull' },
                    { label: 'If +500%', multiplier: 6.0, period: 'SpaceX IPO' },
                  ].map(({ label, multiplier, period }) => {
                    const invested = 10000;
                    const profit = invested * (multiplier - 1);
                    return (
                      <div key={label} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02]">
                        <div>
                          <div className="text-[10px] font-bold text-white">{label}</div>
                          <div className="text-[8px] text-xc-muted">{period}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black font-mono text-emerald-400 profit-glow">
                            +{formatCurrency(profit)}
                          </div>
                          <div className="text-[8px] text-xc-muted">on $10k</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 p-2 rounded-lg bg-amber-950/20 border border-amber-700/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BrainCircuit className="w-3 h-3 text-amber-400" />
                    <span className="text-[9px] font-bold text-amber-400">X-ORACLE INSIGHT</span>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">
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
            <div className="bg-xc-card border border-xc-border rounded-2xl p-3 shrink-0">
              <div className="flex items-center justify-around text-center">
                {[
                  { icon: ShieldCheck, label: 'SEC Compliant', color: 'text-emerald-400' },
                  { icon: Zap, label: '<1ms Exec', color: 'text-cyan-400' },
                  { icon: Volume2, label: '$2.4T Volume', color: 'text-purple-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <Icon className={cn('w-3.5 h-3.5', color)} />
                    <span className="text-[8px] text-xc-muted font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
  time: string;
}

interface OrderBookEntry {
  price: number;
  size: number;
  depth: number;
}

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

// ─── Generators ───────────────────────────────────────────────────────────────
function generateOrderBook(basePrice: number): OrderBookData {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  for (let i = 0; i < 8; i++) {
    bids.push({
      price: basePrice - (i + 1) * (basePrice * 0.001 + Math.random() * basePrice * 0.002),
      size: Math.random() * 500 + 10,
      depth: Math.random() * 80 + 20,
    });
    asks.push({
      price: basePrice + (i + 1) * (basePrice * 0.001 + Math.random() * basePrice * 0.002),
      size: Math.random() * 500 + 10,
      depth: Math.random() * 80 + 20,
    });
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
    data.push({ t: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), c: Math.round(price * 100) / 100 });
  }
  return data;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const HOT_SIGNALS = [
  { symbol: 'TSLA', side: 'BUY' as const, projection: '+18.4%', confidence: 92, reason: 'Q1 deliveries beat · Robotaxi launch Q3', countdown: 247 },
  { symbol: 'SpaceX', side: 'BUY' as const, projection: '+32.1%', confidence: 88, reason: 'Starship Flight 12 catalyst · Starlink 5M subs', countdown: 180 },
  { symbol: 'NVDA', side: 'BUY' as const, projection: '+24.2%', confidence: 94, reason: 'B200 ramp · 2x demand vs supply · xAI order', countdown: 312 },
  { symbol: 'DOGE', side: 'BUY' as const, projection: '+44.7%', confidence: 71, reason: 'X Payments integration rumor · Musk signal', countdown: 125 },
];

const SIGNAL_ASSETS = [
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla, Inc.', type: 'STOCK', price: 342.18, priceChange24h: 3.12 },
  { id: 'spacex', symbol: 'SpaceX', name: 'Space Exploration Technologies', type: 'TOKEN', price: 252.00, priceChange24h: 6.84 },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'STOCK', price: 875.39, priceChange24h: 2.41 },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', type: 'CRYPTO', price: 0.4217, priceChange24h: 8.52 },
];

const QUICK_PICKS = [
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla, Inc.', type: 'STOCK', price: 342.18, priceChange24h: 3.12 },
  { id: 'spacex', symbol: 'SpaceX', name: 'SpaceX', type: 'TOKEN', price: 252.00, priceChange24h: 6.84 },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA', type: 'STOCK', price: 875.39, priceChange24h: 2.41 },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', price: 97842.50, priceChange24h: -1.23 },
];
