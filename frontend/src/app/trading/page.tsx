"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AssetList from "@/components/trading/AssetList";
import OrderForm from "@/components/trading/OrderForm";
import { tradingAPI } from "@/lib/api";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Flame,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Target,
  BarChart3,
  Clock,
  Rocket,
  BrainCircuit,
  ShieldCheck,
  Volume2,
  Globe,
  Layers,
  LineChart,
} from "lucide-react";
import type { Asset } from "@/types";

/* ═══════════════════════════════════════════════════════════════════════════════
   TRADING TERMINAL — Mature layered design · Deep elevation · Spacious
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function TradingPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [chartData, setChartData] = useState<
    Array<{ t: string; c: number; v: number }>
  >([]);
  const [period, setPeriod] = useState<"1D" | "1W" | "1M" | "3M">("1M");
  const [chartLoading, setChartLoading] = useState(false);
  const [liveFeed, setLiveFeed] = useState<LiveTrade[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData>(
    generateOrderBook(248.42),
  );
  const [hotSignals, setHotSignals] = useState(HOT_SIGNALS);
  const [marketOverview, setMarketOverview] = useState(MARKET_SECTORS);
  const [heatmapData, setHeatmapData] = useState(HEATMAP_DATA);

  // ─── Live market prices ────────────────────────────────────────────────────
  const { prices: livePrices } = useMarketPrices({ refreshInterval: 30_000 });

  // Overlay live data onto heatmap changes
  useEffect(() => {
    if (Object.keys(livePrices).length === 0) return;
    setHeatmapData((prev) =>
      prev.map((item) => {
        const live = livePrices[item.symbol];
        return live ? { ...item, change: live.changePercent24h } : item;
      }),
    );
  }, [livePrices]);

  // Live-overlaid signal & quick pick assets
  const liveSignalAssets = useMemo(
    () =>
      SIGNAL_ASSETS.map((a) => {
        const live = livePrices[a.symbol];
        return live
          ? { ...a, price: live.price, priceChange24h: live.changePercent24h }
          : a;
      }),
    [livePrices],
  );
  const liveQuickPicks = useMemo(
    () =>
      QUICK_PICKS.map((p) => {
        const live = livePrices[p.symbol];
        return live
          ? { ...p, price: live.price, priceChange24h: live.changePercent24h }
          : p;
      }),
    [livePrices],
  );

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

  useEffect(() => {
    const interval = setInterval(() => {
      const symbols = [
        "TSLA",
        "NVDA",
        "AAPL",
        "BTC",
        "ETH",
        "DOGE",
        "SpaceX",
        "xAI",
        "PLTR",
        "META",
        "AMZN",
        "XSPACE",
        "SOL",
        "GOOGL",
        "AMD",
        "COIN",
        "AVAX",
        "XRP",
      ];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const side = Math.random() > 0.42 ? "BUY" : "SELL";
      const price = Math.random() * 1000 + 10;
      const amount = Math.random() * 80000 + 500;
      setLiveFeed((prev) => [
        {
          id: Date.now().toString() + Math.random(),
          symbol: sym,
          side,
          price,
          amount,
          time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        },
        ...prev.slice(0, 29),
      ]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedAsset) return;
    const interval = setInterval(() => {
      setOrderBook(generateOrderBook(Number(selectedAsset.price)));
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedAsset?.price]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHotSignals((prev) =>
        prev.map((s) => ({
          ...s,
          confidence: Math.min(
            99,
            Math.max(60, s.confidence + (Math.random() - 0.4) * 3),
          ),
          countdown: Math.max(0, s.countdown - 1),
        })),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketOverview((prev) =>
        prev.map((s) => ({
          ...s,
          change: s.change + (Math.random() - 0.48) * 0.15,
          value: s.value * (1 + (Math.random() - 0.48) * 0.001),
        })),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeatmapData((prev) =>
        prev.map((item) => ({
          ...item,
          change: item.change + (Math.random() - 0.48) * 0.12,
        })),
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const priceChange =
    chartData.length > 1
      ? ((chartData[chartData.length - 1].c - chartData[0].c) /
          chartData[0].c) *
        100
      : 0;

  return (
    <DashboardLayout
      title="Trading Terminal"
      subtitle="Multi-rail execution \u00b7 Real-time intelligence \u00b7 50,000+ assets"
    >
      <div className="space-y-10">
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — HOT SIGNALS  (elevated hero panel)
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-white/10/20 via-transparent to-emerald-600/20 blur-sm pointer-events-none" />
          <div className="relative bg-gradient-to-br from-black/50 via-[#0a0a18] to-emerald-950/30 border border-white/[0.10]/20 rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(217,119,6,0.06),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.05),transparent_60%)] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-lg shadow-black/50/20">
                    <Flame className="w-5 h-5 text-white/50 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight">
                      X-ORACLE HOT SIGNALS
                    </h2>
                    <p className="text-xs text-white/40 mt-0.5">
                      AI-generated trade intelligence \u00b7 Not financial
                      advice
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/30 rounded-full px-4 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    LIVE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5">
                {hotSignals.slice(0, 8).map((signal) => (
                  <button
                    key={signal.symbol}
                    onClick={() => {
                      const a = liveSignalAssets.find(
                        (a) => a.symbol === signal.symbol,
                      );
                      if (a) setSelectedAsset(a as Asset);
                    }}
                    className={cn(
                      "relative group rounded-2xl border-2 transition-all hover:scale-[1.015] active:scale-[0.99] text-left",
                      "p-5 backdrop-blur-sm",
                      signal.side === "BUY"
                        ? "bg-emerald-950/30 border-emerald-700/25 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]"
                        : "bg-red-950/30 border-red-700/25 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.12)]",
                    )}
                  >
                    {/* Inner surface */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        signal.side === "BUY"
                          ? "bg-gradient-to-br from-emerald-900/20 to-transparent"
                          : "bg-gradient-to-br from-red-900/20 to-transparent",
                      )}
                    />

                    {signal.countdown > 0 && signal.countdown < 300 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 rounded-full px-2 py-0.5">
                        <Clock className="w-2.5 h-2.5 text-white/50" />
                        <span className="text-xs font-mono text-white/50 animate-pulse">
                          {Math.floor(signal.countdown / 60)}:
                          {String(signal.countdown % 60).padStart(2, "0")}
                        </span>
                      </div>
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-base font-black text-white">
                          {signal.symbol}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-black px-2 py-0.5 rounded-full",
                            signal.side === "BUY"
                              ? "bg-emerald-500/25 text-emerald-300 signal-flash-green"
                              : "bg-red-500/25 text-red-300",
                          )}
                        >
                          {signal.side}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "text-2xl font-black font-mono mb-3",
                          signal.side === "BUY"
                            ? "text-emerald-400"
                            : "text-red-400",
                        )}
                      >
                        {signal.projection}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              signal.side === "BUY"
                                ? "bg-emerald-500"
                                : "bg-red-500",
                            )}
                            style={{ width: `${signal.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-white/60 w-8 text-right">
                          {signal.confidence.toFixed(0)}%
                        </span>
                      </div>

                      <p className="text-xs text-white/40 leading-relaxed">
                        {signal.reason}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — MARKET HEATMAP
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="bg-[#080814] border border-white/[0.08] rounded-3xl p-8 shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Globe className="w-4 h-4 text-white/50" />
              </div>
              <div>
                <h2 className="font-black text-white text-base tracking-tight">
                  Market Heatmap
                </h2>
                <p className="text-xs text-white/30 mt-0.5">
                  24 tracked assets \u00b7 Color-coded by performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
              Real-time
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
            {heatmapData.map((item) => {
              const intensity = Math.min(1, Math.abs(item.change) / 8);
              const bg =
                item.change >= 0
                  ? `rgba(16, 185, 129, ${0.06 + intensity * 0.3})`
                  : `rgba(239, 68, 68, ${0.06 + intensity * 0.3})`;
              return (
                <button
                  key={item.symbol}
                  onClick={() => {
                    const a = liveSignalAssets.find(
                      (sa) => sa.symbol === item.symbol,
                    );
                    if (a) setSelectedAsset(a as Asset);
                  }}
                  className="p-3.5 rounded-xl border border-white/[0.08] transition-all hover:scale-105 hover:border-white/15 text-center group"
                  style={{ background: bg }}
                >
                  <div className="text-xs font-black text-white group-hover:text-white/90">
                    {item.symbol}
                  </div>
                  <div
                    className={cn(
                      "text-sm font-black font-mono mt-1.5",
                      item.change >= 0 ? "text-emerald-300" : "text-red-300",
                    )}
                  >
                    {item.change >= 0 ? "+" : ""}
                    {item.change.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/30 mt-1">{item.cap}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3A — PRICE CHART (full width — room to breathe)
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-7">
          {/* ── Chart + Volume ─────────────────────────────────────────── */}
          <div className="space-y-7">
            {/* Price Chart — deep elevated panel */}
            <div className="relative bg-[#080814] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent pointer-events-none" />

              {selectedAsset ? (
                <div className="relative z-10">
                  {/* Chart header bar */}
                  <div className="px-8 pt-7 pb-5 border-b border-white/[0.03]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10/15 to-white/10/15 border border-white/[0.08] flex items-center justify-center text-2xl font-black text-white shadow-inner">
                          {selectedAsset.symbol?.[0] ?? "?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-white tracking-tight">
                              {selectedAsset.symbol}
                            </h2>
                            <Badge
                              variant={
                                selectedAsset.type === "STOCK"
                                  ? "default"
                                  : selectedAsset.type === "TOKEN"
                                    ? "purple"
                                    : "info"
                              }
                            >
                              {selectedAsset.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-white/40 mt-1">
                            {selectedAsset.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black font-mono text-white price-shimmer tracking-tight">
                          {formatCurrency(Number(selectedAsset.price))}
                        </div>
                        <div
                          className={cn(
                            "text-base font-bold flex items-center justify-end gap-1 mt-1",
                            priceChange >= 0
                              ? "text-emerald-400"
                              : "text-red-400",
                          )}
                        >
                          {priceChange >= 0 ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                          {priceChange >= 0 ? "+" : ""}
                          {priceChange.toFixed(2)}%
                          <span className="text-xs text-white/30 ml-1">
                            ({period})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart controls + metrics */}
                  <div className="px-8 py-4 flex items-center justify-between border-b border-white/[0.02]">
                    <div className="flex gap-2 bg-white/[0.03] rounded-xl p-1">
                      {(["1D", "1W", "1M", "3M"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPeriod(p)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            period === p
                              ? "bg-xc-purple text-black font-bold shadow-lg shadow-black/50"
                              : "text-white/40 hover:text-white hover:bg-white/[0.04]",
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 text-xs text-white/30">
                      <span>
                        Vol 24h:{" "}
                        <span className="text-white/70 font-mono">
                          {formatCurrency(Math.random() * 5e9 + 1e8)}
                        </span>
                      </span>
                      <span>
                        Mkt Cap:{" "}
                        <span className="text-white/70 font-mono">
                          {formatCurrency(
                            Number(selectedAsset.price) *
                              (Math.random() * 5e9 + 1e8),
                          )}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Chart canvas */}
                  <div className="px-8 pt-6 pb-4">
                    <div style={{ height: 320 }}>
                      {chartLoading ? (
                        <div className="h-full w-full rounded-2xl bg-white/[0.02] animate-pulse" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={chartData}
                            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                          >
                            <defs>
                              <linearGradient
                                id="chartGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor={
                                    priceChange >= 0 ? "#10b981" : "#ef4444"
                                  }
                                  stopOpacity={0.25}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={
                                    priceChange >= 0 ? "#10b981" : "#ef4444"
                                  }
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey="t"
                              tick={{ fill: "#475569", fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              tick={{ fill: "#475569", fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(v) => `$${v}`}
                              domain={["auto", "auto"]}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#0d0d1e",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 12,
                                fontSize: 12,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                              }}
                              formatter={(v: number, name: string) => [
                                name === "c"
                                  ? formatCurrency(v)
                                  : formatCurrency(v),
                                name === "c" ? "Price" : "Volume",
                              ]}
                              labelStyle={{ color: "#64748b" }}
                            />
                            <Area
                              type="monotone"
                              dataKey="c"
                              stroke={priceChange >= 0 ? "#10b981" : "#ef4444"}
                              strokeWidth={2.5}
                              fill="url(#chartGrad)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Stats footer bar */}
                  <div className="px-8 py-4 border-t border-white/[0.03] bg-white/[0.01]">
                    <div className="flex items-center justify-between">
                      {[
                        {
                          label: "Open",
                          value: formatCurrency(
                            Number(selectedAsset.price) * 0.985,
                          ),
                        },
                        {
                          label: "High",
                          value: formatCurrency(
                            Number(selectedAsset.price) * 1.032,
                          ),
                        },
                        {
                          label: "Low",
                          value: formatCurrency(
                            Number(selectedAsset.price) * 0.971,
                          ),
                        },
                        {
                          label: "Prev Close",
                          value: formatCurrency(
                            Number(selectedAsset.price) * 0.994,
                          ),
                        },
                        { label: "Avg Volume", value: "42.8M" },
                        { label: "Spread", value: "0.02%" },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <div className="text-xs text-white/25 uppercase tracking-wider">
                            {label}
                          </div>
                          <div className="text-xs font-mono font-bold text-white/70 mt-1">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center text-center py-24 px-8">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-white/[0.04]/40 to-black/40 border border-white/[0.08] flex items-center justify-center mb-8 shadow-lg animate-pulse">
                    <Rocket className="w-12 h-12 text-white/60" />
                  </div>
                  <h3 className="text-white font-black text-2xl mb-3 tracking-tight">
                    Select an Asset to Trade
                  </h3>
                  <p className="text-white/35 text-sm max-w-md mb-8 leading-relaxed">
                    Choose from 50,000+ assets across stocks, ETFs, crypto,
                    private tokens, commodities, and SPVs.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {liveQuickPicks.map((pick) => (
                      <button
                        key={pick.symbol}
                        onClick={() => setSelectedAsset(pick as Asset)}
                        className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.02] hover:border-white/[0.10] transition-all text-sm shadow-sm"
                      >
                        <span className="font-black text-white text-base">
                          {pick.symbol}
                        </span>
                        <span
                          className={cn(
                            "ml-2 text-xs font-mono",
                            Number(pick.priceChange24h) >= 0
                              ? "text-emerald-400"
                              : "text-red-400",
                          )}
                        >
                          {Number(pick.priceChange24h) >= 0 ? "+" : ""}
                          {Number(pick.priceChange24h).toFixed(1)}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Volume Chart */}
            {selectedAsset && (
              <div className="bg-[#080814] border border-white/[0.08] rounded-3xl p-7 shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-white/50" />
                  </div>
                  <h3 className="font-black text-white text-base">
                    Volume Analysis
                  </h3>
                  <span className="text-xs text-white/30 ml-auto">
                    {selectedAsset.symbol} \u00b7 {period}
                  </span>
                </div>
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                    >
                      <XAxis
                        dataKey="t"
                        tick={{ fill: "#475569", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fill: "#475569", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0d0d1e",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 10,
                          fontSize: 11,
                        }}
                        formatter={(v: number) => [formatCurrency(v), "Volume"]}
                      />
                      <Bar
                        dataKey="v"
                        fill="#7c3aed"
                        opacity={0.5}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3B — ALL MARKETS (full-width, scrollable)
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-[#080814] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
            <div className="px-6 py-5 border-b border-white/[0.08] bg-gradient-to-r from-black/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-white/60" />
                </div>
                <div>
                  <h2 className="font-black text-white text-base">
                    All Markets
                  </h2>
                  <p className="text-xs text-white/30">50,000+ instruments</p>
                </div>
                <span className="ml-auto flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                  LIVE
                </span>
              </div>
            </div>
            <div className="p-4" style={{ height: 520, overflowY: "auto" }}>
              <AssetList
                onSelect={setSelectedAsset}
                selectedSymbol={selectedAsset?.symbol}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3C — ORDER FORM + PROJECTIONS (comfortable 2-col)
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="grid lg:grid-cols-2 gap-7">
            {/* Order Form Panel */}
            <div className="relative bg-[#080814] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
              {selectedAsset && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/20/[0.04] to-transparent pointer-events-none" />
              )}
              <div className="relative z-10">
                <div className="px-7 py-5 border-b border-white/[0.08] bg-gradient-to-r from-black/15 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-white/60" />
                    </div>
                    <h2 className="font-black text-white text-base">
                      Place Order
                    </h2>
                  </div>
                </div>
                <div className="p-7">
                  <OrderForm asset={selectedAsset} />
                </div>
              </div>
            </div>

            {/* Profit Projections — elevated */}
            {selectedAsset && (
              <div className="relative bg-[#080814] border border-emerald-800/20 rounded-3xl overflow-hidden shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 to-transparent pointer-events-none" />
                <div className="relative z-10 p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-800/30 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Profit Projections
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "If +10%", multiplier: 1.1, period: "7D avg" },
                      {
                        label: "If +25%",
                        multiplier: 1.25,
                        period: "30D target",
                      },
                      {
                        label: "If +100%",
                        multiplier: 2.0,
                        period: "12M bull",
                      },
                      {
                        label: "If +500%",
                        multiplier: 6.0,
                        period: "SpaceX IPO",
                      },
                    ].map(({ label, multiplier, period: pd }) => {
                      const invested = 10000;
                      const profit = invested * (multiplier - 1);
                      return (
                        <div
                          key={label}
                          className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.03]"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">
                              {label}
                            </div>
                            <div className="text-xs text-white/30 mt-0.5">
                              {pd}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black font-mono text-emerald-400 profit-glow">
                              +{formatCurrency(profit)}
                            </div>
                            <div className="text-xs text-white/30">
                              on $10k invested
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Insight */}
                  <div className="mt-5 p-4 rounded-xl bg-white/[0.03]/15 border border-white/[0.10]/15">
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit className="w-4 h-4 text-white/50" />
                      <span className="text-xs font-bold text-white/50 tracking-wider uppercase">
                        X-ORACLE INSIGHT
                      </span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">
                      {selectedAsset.symbol} is trading{" "}
                      {Number(selectedAsset.priceChange24h ?? 0) >= 0
                        ? "above"
                        : "below"}{" "}
                      its 20-day SMA with{" "}
                      {Number(selectedAsset.priceChange24h ?? 0) >= 0
                        ? "bullish"
                        : "bearish"}{" "}
                      momentum. AI confidence:{" "}
                      <span className="text-emerald-400 font-bold">
                        {(75 + Math.random() * 20).toFixed(0)}%
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trust badges — inset panel */}
            <div className="bg-[#080814] border border-white/[0.08] rounded-3xl p-6 shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-around text-center">
                {[
                  {
                    icon: ShieldCheck,
                    label: "SEC Compliant",
                    color: "text-emerald-400",
                  },
                  {
                    icon: Zap,
                    label: "<1ms Execution",
                    color: "text-white/50",
                  },
                  {
                    icon: Volume2,
                    label: "$2.4T Volume",
                    color: "text-white/60",
                  },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                      <Icon className={cn("w-4 h-4", color)} />
                    </div>
                    <span className="text-xs text-white/35 font-medium">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4 — ORDER BOOK + LIVE TRADES (deep panels, side by side)
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="grid lg:grid-cols-2 gap-7">
          {/* Order Book */}
          <div className="bg-[#080814] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
            <div className="px-7 py-5 border-b border-white/[0.08] bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-white/50" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    Order Book
                  </h3>
                  <p className="text-xs text-white/30">
                    {selectedAsset ? selectedAsset.symbol : "Select asset"}{" "}
                    \u00b7 Depth L2
                  </p>
                </div>
              </div>
            </div>
            <div className="p-7">
              {selectedAsset ? (
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="flex justify-between text-xs text-white/30 mb-4 uppercase font-bold tracking-wider">
                      <span>Bid Price</span>
                      <span>Size</span>
                      <span>Total</span>
                    </div>
                    <div className="space-y-3">
                      {orderBook.bids.map((bid, i) => {
                        const cumSize = orderBook.bids
                          .slice(0, i + 1)
                          .reduce((s, b) => s + b.size, 0);
                        return (
                          <div
                            key={i}
                            className="flex justify-between text-xs relative py-1.5 px-2 rounded-lg"
                          >
                            <div
                              className="absolute inset-0 bg-emerald-500/[0.06] rounded-lg"
                              style={{ width: `${bid.depth}%` }}
                            />
                            <span className="font-mono text-emerald-400 relative z-10">
                              ${bid.price.toFixed(2)}
                            </span>
                            <span className="font-mono text-white/50 relative z-10">
                              {bid.size.toFixed(2)}
                            </span>
                            <span className="font-mono text-white/25 relative z-10">
                              {cumSize.toFixed(0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/30 mb-4 uppercase font-bold tracking-wider">
                      <span>Ask Price</span>
                      <span>Size</span>
                      <span>Total</span>
                    </div>
                    <div className="space-y-3">
                      {orderBook.asks.map((ask, i) => {
                        const cumSize = orderBook.asks
                          .slice(0, i + 1)
                          .reduce((s, a) => s + a.size, 0);
                        return (
                          <div
                            key={i}
                            className="flex justify-between text-xs relative py-1.5 px-2 rounded-lg"
                          >
                            <div
                              className="absolute inset-0 bg-red-500/[0.06] rounded-lg"
                              style={{ width: `${ask.depth}%` }}
                            />
                            <span className="font-mono text-red-400 relative z-10">
                              ${ask.price.toFixed(2)}
                            </span>
                            <span className="font-mono text-white/50 relative z-10">
                              {ask.size.toFixed(2)}
                            </span>
                            <span className="font-mono text-white/25 relative z-10">
                              {cumSize.toFixed(0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-white/25 text-sm">
                  Select an asset to view order book depth
                </div>
              )}
            </div>
          </div>

          {/* Live Trades Feed */}
          <div className="bg-[#080814] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
            <div className="px-7 py-5 border-b border-white/[0.08] bg-gradient-to-r from-emerald-950/15 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-800/30 flex items-center justify-center">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    Live Trades
                  </h3>
                  <p className="text-xs text-white/30">
                    Streaming \u00b7 All markets
                  </p>
                </div>
                <span className="ml-auto flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                  LIVE
                </span>
              </div>
            </div>
            <div className="p-7">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-5 gap-y-1.5 text-xs">
                <span className="text-xs text-white/25 font-bold uppercase pb-3 tracking-wider">
                  Side
                </span>
                <span className="text-xs text-white/25 font-bold uppercase pb-3 tracking-wider">
                  Asset
                </span>
                <span className="text-xs text-white/25 font-bold uppercase pb-3 text-right tracking-wider">
                  Price
                </span>
                <span className="text-xs text-white/25 font-bold uppercase pb-3 text-right tracking-wider">
                  Amount
                </span>
                <span className="text-xs text-white/25 font-bold uppercase pb-3 text-right tracking-wider">
                  Time
                </span>

                {liveFeed.slice(0, 14).map((trade, i) => (
                  <div
                    key={trade.id}
                    className={cn("contents", i === 0 ? "trade-flash" : "")}
                  >
                    <span
                      className={cn(
                        "font-bold py-1.5",
                        trade.side === "BUY"
                          ? "text-emerald-400"
                          : "text-red-400",
                      )}
                    >
                      {trade.side}
                    </span>
                    <span className="font-bold text-white py-1.5">
                      {trade.symbol}
                    </span>
                    <span className="font-mono text-white/50 py-1.5 text-right">
                      ${trade.price.toFixed(2)}
                    </span>
                    <span className="font-mono text-white/60 py-1.5 text-right">
                      {formatCurrency(trade.amount)}
                    </span>
                    <span className="text-white/25 font-mono py-1.5 text-right">
                      {trade.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5 — SECTOR PERFORMANCE (spacious grid with charts)
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="bg-[#080814] border border-white/[0.08] rounded-3xl p-8 shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <LineChart className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <h2 className="font-black text-white text-base tracking-tight">
                  Sector Performance
                </h2>
                <p className="text-xs text-white/30 mt-0.5">
                  12 sectors \u00b7 Updated every 3 seconds
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
              LIVE
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {marketOverview.map((sector) => (
              <div
                key={sector.name}
                className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.08] transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-white tracking-tight">
                    {sector.name}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-black font-mono tabular-nums",
                      sector.change >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {sector.change >= 0 ? "+" : ""}
                    {sector.change.toFixed(2)}%
                  </span>
                </div>
                <div style={{ height: 70 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sector.data}
                      margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
                    >
                      <defs>
                        <linearGradient
                          id={`sg-${sector.name}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={
                              sector.change >= 0 ? "#10b981" : "#ef4444"
                            }
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor={
                              sector.change >= 0 ? "#10b981" : "#ef4444"
                            }
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={sector.change >= 0 ? "#10b981" : "#ef4444"}
                        strokeWidth={1.5}
                        fill={`url(#sg-${sector.name})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] font-bold text-white/50">
                    {sector.assets.toLocaleString()} assets
                  </span>
                  <span className="text-[11px] font-black font-mono text-white/70">
                    {formatCurrency(sector.value, true)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6 — TOP MOVERS
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="grid lg:grid-cols-2 gap-7">
          {/* Gainers */}
          <div className="bg-[#080814] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
            <div className="px-7 py-5 border-b border-white/[0.08] bg-gradient-to-r from-emerald-950/15 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-800/30 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h3 className="font-black text-white text-base">Top Gainers</h3>
                <span className="ml-auto text-xs text-white/25">24h</span>
              </div>
            </div>
            <div className="p-7 space-y-3">
              {TOP_GAINERS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset as Asset)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-950/8 border border-emerald-800/15 hover:border-emerald-600/30 transition-all text-left group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-900/30 border border-emerald-800/20 flex items-center justify-center text-sm font-black text-emerald-400 group-hover:scale-105 transition-transform">
                    {asset.symbol?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-base">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-white/30 truncate">
                      {asset.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">
                      {formatCurrency(Number(asset.price))}
                    </div>
                    <div className="text-sm font-black text-emerald-400">
                      +{Number(asset.priceChange24h).toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div className="bg-[#080814] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_4px_60px_-12px_rgba(0,0,0,0.5)]">
            <div className="px-7 py-5 border-b border-white/[0.08] bg-gradient-to-r from-red-950/15 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-900/40 border border-red-800/30 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                </div>
                <h3 className="font-black text-white text-base">Top Losers</h3>
                <span className="ml-auto text-xs text-white/25">24h</span>
              </div>
            </div>
            <div className="p-7 space-y-3">
              {TOP_LOSERS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset as Asset)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-950/8 border border-red-800/15 hover:border-red-600/30 transition-all text-left group"
                >
                  <div className="w-11 h-11 rounded-xl bg-red-900/30 border border-red-800/20 flex items-center justify-center text-sm font-black text-red-400 group-hover:scale-105 transition-transform">
                    {asset.symbol?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-base">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-white/30 truncate">
                      {asset.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">
                      {formatCurrency(Number(asset.price))}
                    </div>
                    <div className="text-sm font-black text-red-400">
                      {Number(asset.priceChange24h).toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveTrade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
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
  for (let i = 0; i < 10; i++) {
    bids.push({
      price:
        basePrice -
        (i + 1) * (basePrice * 0.001 + Math.random() * basePrice * 0.002),
      size: Math.random() * 500 + 10,
      depth: Math.random() * 80 + 20,
    });
    asks.push({
      price:
        basePrice +
        (i + 1) * (basePrice * 0.001 + Math.random() * basePrice * 0.002),
      size: Math.random() * 500 + 10,
      depth: Math.random() * 80 + 20,
    });
  }
  return { bids, asks };
}

function generateMockBars(basePrice: number, period: string) {
  const count =
    period === "1D" ? 24 : period === "1W" ? 7 : period === "1M" ? 30 : 90;
  const data = [];
  let price = basePrice * (1 - 0.15 * Math.random());
  const now = new Date();
  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    if (period === "1D") d.setHours(d.getHours() - i);
    else d.setDate(d.getDate() - i);
    price *= 1 + (Math.random() - 0.47) * 0.03;
    data.push({
      t: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
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
  {
    symbol: "TSLA",
    side: "BUY" as const,
    projection: "+18.4%",
    confidence: 92,
    reason: "Q1 deliveries beat \u00b7 Robotaxi launch Q3",
    countdown: 247,
  },
  {
    symbol: "SpaceX",
    side: "BUY" as const,
    projection: "+32.1%",
    confidence: 88,
    reason: "Starship Flight 12 \u00b7 Starlink 5M subs",
    countdown: 180,
  },
  {
    symbol: "NVDA",
    side: "BUY" as const,
    projection: "+24.2%",
    confidence: 94,
    reason: "B200 ramp \u00b7 2x demand vs supply",
    countdown: 312,
  },
  {
    symbol: "DOGE",
    side: "BUY" as const,
    projection: "+44.7%",
    confidence: 71,
    reason: "X Payments integration rumor",
    countdown: 125,
  },
  {
    symbol: "SOL",
    side: "BUY" as const,
    projection: "+28.3%",
    confidence: 82,
    reason: "Firedancer mainnet \u00b7 DeFi TVL ATH",
    countdown: 198,
  },
  {
    symbol: "AMD",
    side: "BUY" as const,
    projection: "+16.8%",
    confidence: 79,
    reason: "MI400 launch \u00b7 hyperscaler wins",
    countdown: 267,
  },
  {
    symbol: "COIN",
    side: "BUY" as const,
    projection: "+22.5%",
    confidence: 85,
    reason: "ETF inflows record \u00b7 staking revenue",
    countdown: 154,
  },
  {
    symbol: "XAI",
    side: "BUY" as const,
    projection: "+55.2%",
    confidence: 76,
    reason: "Grok-4 benchmark \u00b7 pre-IPO round",
    countdown: 89,
  },
];

const SIGNAL_ASSETS = [
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla, Inc.",
    type: "STOCK",
    price: 342.18,
    priceChange24h: 3.12,
  },
  {
    id: "spacex",
    symbol: "SpaceX",
    name: "Space Exploration Technologies",
    type: "TOKEN",
    price: 252.0,
    priceChange24h: 6.84,
  },
  {
    id: "nvda",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    type: "STOCK",
    price: 875.39,
    priceChange24h: 2.41,
  },
  {
    id: "doge",
    symbol: "DOGE",
    name: "Dogecoin",
    type: "CRYPTO",
    price: 0.4217,
    priceChange24h: 8.52,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    type: "CRYPTO",
    price: 187.63,
    priceChange24h: 5.17,
  },
  {
    id: "amd",
    symbol: "AMD",
    name: "Advanced Micro Devices",
    type: "STOCK",
    price: 164.78,
    priceChange24h: 3.47,
  },
  {
    id: "coin",
    symbol: "COIN",
    name: "Coinbase Global",
    type: "STOCK",
    price: 267.12,
    priceChange24h: 5.84,
  },
  {
    id: "xai",
    symbol: "XAI",
    name: "xAI Venture Token",
    type: "TOKEN",
    price: 180.0,
    priceChange24h: 12.4,
  },
];

const QUICK_PICKS = [
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla, Inc.",
    type: "STOCK",
    price: 342.18,
    priceChange24h: 3.12,
  },
  {
    id: "spacex",
    symbol: "SpaceX",
    name: "SpaceX",
    type: "TOKEN",
    price: 252.0,
    priceChange24h: 6.84,
  },
  {
    id: "nvda",
    symbol: "NVDA",
    name: "NVIDIA",
    type: "STOCK",
    price: 875.39,
    priceChange24h: 2.41,
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    type: "CRYPTO",
    price: 97842.5,
    priceChange24h: -1.23,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    type: "CRYPTO",
    price: 187.63,
    priceChange24h: 5.17,
  },
  {
    id: "xai",
    symbol: "XAI",
    name: "xAI",
    type: "TOKEN",
    price: 180.0,
    priceChange24h: 12.4,
  },
];

const HEATMAP_DATA = [
  { symbol: "TSLA", change: 3.21, cap: "$1.08T" },
  { symbol: "NVDA", change: 2.15, cap: "$2.18T" },
  { symbol: "AAPL", change: 0.54, cap: "$3.42T" },
  { symbol: "META", change: 2.77, cap: "$1.31T" },
  { symbol: "AMZN", change: -0.82, cap: "$2.01T" },
  { symbol: "MSFT", change: 1.04, cap: "$3.12T" },
  { symbol: "GOOGL", change: -0.14, cap: "$2.21T" },
  { symbol: "BTC", change: -1.23, cap: "$1.92T" },
  { symbol: "ETH", change: 2.64, cap: "$462B" },
  { symbol: "SOL", change: 5.17, cap: "$84B" },
  { symbol: "DOGE", change: 8.52, cap: "$58B" },
  { symbol: "AMD", change: 3.47, cap: "$267B" },
  { symbol: "PLTR", change: 4.55, cap: "$54B" },
  { symbol: "COIN", change: 5.84, cap: "$67B" },
  { symbol: "SpaceX", change: 6.84, cap: "$350B" },
  { symbol: "XAI", change: 12.4, cap: "$45B" },
  { symbol: "NFLX", change: -1.08, cap: "$278B" },
  { symbol: "CRM", change: 1.23, cap: "$263B" },
  { symbol: "UBER", change: 2.31, cap: "$162B" },
  { symbol: "SNAP", change: -2.41, cap: "$23B" },
  { symbol: "XRP", change: 4.22, cap: "$118B" },
  { symbol: "AVAX", change: 3.18, cap: "$15B" },
  { symbol: "LINK", change: 1.56, cap: "$11B" },
  { symbol: "ARKK", change: 1.33, cap: "$6.2B" },
];

const MARKET_SECTORS = [
  {
    name: "Technology",
    change: 2.34,
    value: 14.2e12,
    assets: 842,
    data: generateSectorData(),
  },
  {
    name: "Crypto",
    change: 3.87,
    value: 2.8e12,
    assets: 12400,
    data: generateSectorData(),
  },
  {
    name: "Space",
    change: 5.12,
    value: 890e9,
    assets: 127,
    data: generateSectorData(),
  },
  {
    name: "AI / ML",
    change: 4.22,
    value: 3.4e12,
    assets: 312,
    data: generateSectorData(),
  },
  {
    name: "Energy",
    change: -0.87,
    value: 5.1e12,
    assets: 524,
    data: generateSectorData(),
  },
  {
    name: "Commodities",
    change: 0.42,
    value: 1.2e12,
    assets: 86,
    data: generateSectorData(),
  },
  {
    name: "Healthcare",
    change: 1.15,
    value: 6.8e12,
    assets: 1240,
    data: generateSectorData(),
  },
  {
    name: "Finance",
    change: -0.34,
    value: 8.2e12,
    assets: 892,
    data: generateSectorData(),
  },
  {
    name: "EV / Auto",
    change: 3.18,
    value: 2.1e12,
    assets: 214,
    data: generateSectorData(),
  },
  {
    name: "DeFi",
    change: 6.42,
    value: 180e9,
    assets: 3400,
    data: generateSectorData(),
  },
  {
    name: "Gaming",
    change: 1.87,
    value: 420e9,
    assets: 156,
    data: generateSectorData(),
  },
  {
    name: "Private Equity",
    change: 2.08,
    value: 1.4e12,
    assets: 48,
    data: generateSectorData(),
  },
];

const TOP_GAINERS = [
  {
    id: "xai",
    symbol: "XAI",
    name: "xAI Venture Token",
    type: "TOKEN",
    price: 180.0,
    priceChange24h: 12.4,
  },
  {
    id: "xdoge",
    symbol: "XDOGE",
    name: "X-DOGE Meme Economy",
    type: "FUND",
    price: 24.67,
    priceChange24h: 11.32,
  },
  {
    id: "xneura",
    symbol: "XNEURA",
    name: "Neuralink BCI Token",
    type: "TOKEN",
    price: 48.5,
    priceChange24h: 9.8,
  },
  {
    id: "doge",
    symbol: "DOGE",
    name: "Dogecoin",
    type: "CRYPTO",
    price: 0.4217,
    priceChange24h: 8.52,
  },
  {
    id: "xoptimus",
    symbol: "XOPTIMUS",
    name: "Tesla Optimus Token",
    type: "TOKEN",
    price: 67.3,
    priceChange24h: 7.12,
  },
];

const TOP_LOSERS = [
  {
    id: "snap",
    symbol: "SNAP",
    name: "Snap Inc.",
    type: "STOCK",
    price: 14.23,
    priceChange24h: -2.41,
  },
  {
    id: "dot",
    symbol: "DOT",
    name: "Polkadot",
    type: "CRYPTO",
    price: 7.84,
    priceChange24h: -1.89,
  },
  {
    id: "xenergy",
    symbol: "XENERGY",
    name: "X-ENERGY Green Grid",
    type: "TOKEN",
    price: 6.2,
    priceChange24h: -1.45,
  },
  {
    id: "ibit",
    symbol: "IBIT",
    name: "iShares Bitcoin Trust",
    type: "ETF",
    price: 52.89,
    priceChange24h: -1.34,
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    type: "CRYPTO",
    price: 97842.5,
    priceChange24h: -1.23,
  },
];
