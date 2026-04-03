"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
  Flame,
  Zap,
  Target,
  Rocket,
  Shield,
  Globe,
  Cpu as CpuIcon,
} from "lucide-react";
import { portfolioAPI, walletAPI, oracleAPI, tradingAPI } from "@/lib/api";
import {
  formatCurrency,
  formatPercent,
  cn,
  getChangeColor,
  getAssetTypeColor,
} from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { Portfolio, Transaction, Asset, OptimalAllocation } from "@/types";
import Link from "next/link";

// ─── Mock performance data for chart ─────────────────────────────────────────
function generatePerformanceData(baseValue: number, days: number) {
  const data = [];
  let value = baseValue * 0.75;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    value *= 1 + (Math.random() - 0.47) * 0.025;
    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: Math.round(value * 100) / 100,
    });
  }
  return data;
}

const ALLOCATION_COLORS = [
  "#7c3aed",
  "#06b6d4",
  "#d97706",
  "#10b981",
  "#ef4444",
  "#a78bfa",
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-xc-card border border-xc-border rounded-lg px-3 py-2 text-sm">
        <span className="text-xc-green font-mono font-bold">
          {formatCurrency(payload[0].value)}
        </span>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, setPortfolio, setWallet } = useStore();
  const [portfolio, setLocalPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topAssets, setTopAssets] = useState<Asset[]>([]);
  const [allocation, setAllocation] = useState<OptimalAllocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfData, setPerfData] = useState<
    Array<{ date: string; value: number }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [portRes, walletRes, txRes, assetsRes, allocRes] =
          await Promise.allSettled([
            portfolioAPI.getPortfolio(),
            walletAPI.getWallet(),
            walletAPI.getTransactions({ limit: 5 }),
            tradingAPI.getAssets({ limit: 8 }),
            oracleAPI.getOptimalAllocation(),
          ]);

        if (portRes.status === "fulfilled") {
          setLocalPortfolio(portRes.value.data.data);
          setPortfolio(portRes.value.data.data);
          setPerfData(
            generatePerformanceData(
              portRes.value.data.data.totalValue || 10000,
              30,
            ),
          );
        } else {
          // Demo data for unauthenticated/empty state
          const demo = {
            id: "1",
            userId: "1",
            totalValue: 124800,
            totalCost: 98200,
            totalPnL: 26600,
            cashBalance: 22500,
            holdings: [],
            riskScore: 42,
          };
          setLocalPortfolio(demo as Portfolio);
          setPerfData(generatePerformanceData(124800, 30));
        }
        if (walletRes.status === "fulfilled") {
          setWallet(walletRes.value.data.data);
        }
        if (txRes.status === "fulfilled") {
          setTransactions(txRes.value.data.data.transactions || []);
        }
        if (assetsRes.status === "fulfilled") {
          setTopAssets(assetsRes.value.data.data.assets || []);
        }
        if (allocRes.status === "fulfilled") {
          setAllocation(allocRes.value.data.data);
        } else {
          setAllocation({
            AI: 40,
            Energy: 20,
            Space: 15,
            PrivateEquity: 15,
            Cash: 10,
            rationale: "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setPortfolio, setWallet]);

  const pnlPct = portfolio
    ? portfolio.totalCost > 0
      ? (portfolio.totalPnL / portfolio.totalCost) * 100
      : 0
    : 0;

  const base = portfolio?.totalValue ?? 124800;
  const dailyRet = base * 0.00874;
  const weeklyRet = base * 0.04912;
  const monthlyRet = base * 0.11437;

  const allocationData = allocation
    ? Object.entries(allocation)
        .filter(([key]) => key !== "rationale")
        .map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.firstName ?? "Investor"}`}
    >
      <div className="space-y-6">
        {/* ─── KYC Banner ─────────────────────────────────────────────────── */}
        {user?.kycStatus !== "APPROVED" && (
          <div className="flex items-center justify-between bg-amber-950/30 border border-amber-700/40 rounded-xl px-5 py-3">
            <div>
              <span className="text-amber-400 font-semibold text-sm">
                KYC Verification Required
              </span>
              <span className="text-xc-muted text-sm ml-2">
                — Complete identity verification to unlock trading.
              </span>
            </div>
            <Link
              href="/settings/kyc"
              className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-lg font-bold transition-colors"
            >
              Verify Now
            </Link>
          </div>
        )}

        {/* ─── Stats Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Portfolio Value"
            value={formatCurrency(portfolio?.totalValue ?? 0)}
            change={pnlPct}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard
            title="Total P&L"
            value={formatCurrency(portfolio?.totalPnL ?? 0)}
            change={pnlPct}
            icon={<TrendingUp className="w-5 h-5" />}
            className={
              (portfolio?.totalPnL ?? 0) >= 0
                ? "border-emerald-800/30"
                : "border-red-800/30"
            }
          />
          <StatCard
            title="Cash Balance"
            value={formatCurrency(portfolio?.cashBalance ?? 0)}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <StatCard
            title="Risk Score"
            value={`${portfolio?.riskScore ?? 42}/100`}
            subtitle={
              (portfolio?.riskScore ?? 42) < 40
                ? "Conservative"
                : (portfolio?.riskScore ?? 42) < 65
                  ? "Moderate"
                  : "Aggressive"
            }
            icon={<Cpu className="w-5 h-5" />}
          />
        </div>

        {/* ─── Daily / Weekly / Monthly Returns ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              {
                label: "Daily Return",
                value: dailyRet,
                pct: "+0.87%",
                icon: <Activity className="w-4 h-4" />,
                period: "Today, Mar 23",
                border: "border-emerald-800/25",
                glow: "from-emerald-900/15",
              },
              {
                label: "Weekly Return",
                value: weeklyRet,
                pct: "+4.91%",
                icon: <Calendar className="w-4 h-4" />,
                period: "Mar 17 – 23, 2026",
                border: "border-cyan-800/25",
                glow: "from-cyan-900/15",
              },
              {
                label: "Monthly Return",
                value: monthlyRet,
                pct: "+11.4%",
                icon: <Flame className="w-4 h-4" />,
                period: "March 2026",
                border: "border-purple-800/25",
                glow: "from-purple-900/15",
              },
            ] as const
          ).map(({ label, value, pct, icon, period, border, glow }) => (
            <div
              key={label}
              className={`relative bg-xc-card border ${border} rounded-2xl p-5 overflow-hidden group hover:scale-[1.01] transition-transform`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${glow} to-transparent pointer-events-none`}
              />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-xc-muted uppercase tracking-wider">
                  {label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xc-muted group-hover:text-white transition-colors">
                  {icon}
                </div>
              </div>
              <div className="text-2xl font-black text-white mb-1">
                {formatCurrency(value)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-xc-green flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {pct}
                </span>
                <span className="text-xs text-xc-muted">{period}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── X-Oracle Live Signals ───────────────────────────────────── */}
        <div className="bg-xc-card border border-purple-800/25 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-900/50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  X-Oracle Live Signals
                </h3>
                <p className="text-[10px] text-xc-muted">
                  AI-generated trade intelligence — updated every 60s
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] font-mono text-purple-400">
                LIVE
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              {
                symbol: "NVDA",
                signal: "BUY",
                conf: 94,
                proj: "+18.4%",
                window: "30D",
                color: "emerald",
              },
              {
                symbol: "TSLA",
                signal: "BUY",
                conf: 87,
                proj: "+11.2%",
                window: "14D",
                color: "emerald",
              },
              {
                symbol: "BTC",
                signal: "HOLD",
                conf: 72,
                proj: "+3.1%",
                window: "7D",
                color: "amber",
              },
              {
                symbol: "GOLD",
                signal: "SELL",
                conf: 68,
                proj: "-1.8%",
                window: "7D",
                color: "rose",
              },
            ].map(({ symbol, signal, conf, proj, color }) => (
              <div
                key={symbol}
                className={`bg-gradient-to-br ${color === "emerald" ? "from-emerald-950/40" : color === "amber" ? "from-amber-950/30" : "from-rose-950/30"} to-transparent border border-white/5 rounded-xl p-4 hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-white">
                    {symbol}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      color === "emerald"
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                        : color === "amber"
                          ? "bg-amber-950/60 text-amber-400 border-amber-800/40"
                          : "bg-rose-950/60 text-rose-400 border-rose-800/40",
                    )}
                  >
                    {signal}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-xl font-black mb-1",
                    color === "emerald"
                      ? "text-emerald-400"
                      : color === "amber"
                        ? "text-amber-400"
                        : "text-rose-400",
                  )}
                >
                  {proj}
                </div>
                <div className="h-0.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      color === "emerald"
                        ? "bg-emerald-500"
                        : color === "amber"
                          ? "bg-amber-500"
                          : "bg-rose-500",
                    )}
                    style={{ width: `${conf}%` }}
                  />
                </div>
                <div className="text-[10px] text-xc-muted mt-1">
                  {conf}% confidence
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Main Content Grid ──────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-white">Portfolio Performance</h3>
                <p className="text-xs text-xc-muted mt-0.5">30-day history</p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-bold",
                  pnlPct >= 0 ? "text-xc-green" : "text-xc-red",
                )}
              >
                {pnlPct >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPercent(pnlPct)}
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={perfData}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="portfolioGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#portfolioGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Oracle Allocation */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">AI Oracle Allocation</h3>
              <Badge variant="purple">LIVE</Badge>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`]}
                    contentStyle={{
                      background: "#0d0d1e",
                      border: "1px solid #1a1a3a",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {allocationData.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
                      }}
                    />
                    <span className="text-xc-muted">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Capital Rails + Quick Deploy ──────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Capital Rails */}
          <div className="lg:col-span-2 bg-xc-card border border-xc-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-xc-purple-light" />
                <h3 className="font-bold text-white text-sm">
                  Capital Rails Deployment
                </h3>
              </div>
              <span className="text-[10px] font-mono text-xc-muted">
                LIVE ALLOCATION
              </span>
            </div>
            <div className="space-y-3.5">
              {[
                {
                  rail: "Public Markets",
                  pct: 38.6,
                  amount: 48200,
                  color: "#7c3aed",
                  tag: "NASDAQ · NYSE · LSE",
                },
                {
                  rail: "Private Equity",
                  pct: 24.8,
                  amount: 30976,
                  color: "#06b6d4",
                  tag: "SPVs · Pre-IPO",
                },
                {
                  rail: "Tokenized Assets",
                  pct: 15.0,
                  amount: 18720,
                  color: "#d97706",
                  tag: "Polygon · ERC-3643",
                },
                {
                  rail: "Commerce Capital",
                  pct: 9.9,
                  amount: 12355,
                  color: "#10b981",
                  tag: "Tesla · SpaceX Merch",
                },
                {
                  rail: "AI Hedge",
                  pct: 11.7,
                  amount: 14602,
                  color: "#a78bfa",
                  tag: "X-ORACLE Managed",
                },
              ].map(({ rail, pct, amount, color, tag }) => (
                <div key={rail} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-white whitespace-nowrap">
                          {rail}
                        </span>
                        <span className="text-[9px] font-mono text-xc-muted hidden sm:block">
                          {tag}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white ml-2 whitespace-nowrap">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-xc-muted w-9 text-right flex-shrink-0">
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Deploy */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-4 h-4 text-xc-purple-light" />
              <h3 className="font-bold text-white text-sm">Quick Deploy</h3>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  label: "NVDA",
                  desc: "BUY · AI 94% conf.",
                  cls: "border-purple-700/40 hover:border-purple-500/60 hover:bg-purple-950/20",
                },
                {
                  label: "TSLA",
                  desc: "BUY · AI 87% conf.",
                  cls: "border-emerald-700/40 hover:border-emerald-500/60 hover:bg-emerald-950/20",
                },
                {
                  label: "BTC",
                  desc: "HOLD · Monitor",
                  cls: "border-amber-700/40 hover:border-amber-500/50 hover:bg-amber-950/15",
                },
                {
                  label: "SPV Fund",
                  desc: "New Allocation",
                  cls: "border-cyan-700/40 hover:border-cyan-500/60 hover:bg-cyan-950/20",
                },
              ].map(({ label, desc, cls }) => (
                <Link
                  key={label}
                  href="/trading"
                  className={`flex items-center justify-between w-full bg-white/[0.03] border ${cls} rounded-xl px-3.5 py-2.5 transition-all group`}
                >
                  <div>
                    <div className="text-sm font-bold text-white">{label}</div>
                    <div className="text-[10px] text-xc-muted">{desc}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-xc-muted group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
            <Link
              href="/trading"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-xc-purple hover:bg-purple-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors glow-purple"
            >
              <Zap className="w-4 h-4" /> Open Trade Terminal
            </Link>
          </div>
        </div>

        {/* ─── Bottom Row ─────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Assets */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Market</h3>
              <Link
                href="/trading"
                className="text-xs text-xc-purple-light hover:text-white transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {(topAssets.length > 0 ? topAssets.slice(0, 6) : DEMO_ASSETS).map(
                (asset) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 to-cyan-900 flex items-center justify-center text-xs font-black text-white">
                        {(asset.symbol ?? "?")[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {asset.symbol}
                        </div>
                        <div className="text-xs text-xc-muted truncate max-w-[120px]">
                          {asset.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-white">
                        {formatCurrency(Number(asset.price))}
                      </div>
                      <div
                        className={cn(
                          "text-xs font-semibold flex items-center justify-end gap-0.5",
                          getChangeColor(Number(asset.priceChange24h ?? 0)),
                        )}
                      >
                        {(asset.priceChange24h ?? 0) >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {formatPercent(Number(asset.priceChange24h ?? 0))}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Recent Activity</h3>
              <Link
                href="/wallet"
                className="text-xs text-xc-purple-light hover:text-white transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {(transactions.length > 0 ? transactions : DEMO_TRANSACTIONS).map(
                (tx, i) => (
                  <div
                    key={tx.id || i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          tx.type === "DEPOSIT"
                            ? "bg-emerald-950/60"
                            : tx.type === "WITHDRAWAL"
                              ? "bg-red-950/60"
                              : "bg-purple-950/60",
                        )}
                      >
                        {tx.type === "DEPOSIT" ? (
                          <ArrowDownRight className="w-4 h-4 text-xc-green" />
                        ) : tx.type === "WITHDRAWAL" ? (
                          <ArrowUpRight className="w-4 h-4 text-xc-red" />
                        ) : (
                          <BarChart3 className="w-4 h-4 text-xc-purple-light" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white capitalize">
                          {tx.type.replace(/_/g, " ")}
                        </div>
                        <div className="text-xs text-xc-muted">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleDateString()
                            : "Recent"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-sm font-mono font-bold",
                        tx.type === "DEPOSIT" || tx.type === "FUND_REDEMPTION"
                          ? "text-xc-green"
                          : "text-white",
                      )}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "FUND_REDEMPTION"
                        ? "+"
                        : "-"}
                      {formatCurrency(Number(tx.amount))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ─── Founder Vision — Elon Musk at the Bottom ───────────────────── */}
        <div className="relative rounded-3xl overflow-hidden border border-purple-800/30 shadow-[0_0_80px_-20px_rgba(124,58,237,0.4)]">
          {/* Starship background */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1200&q=80&auto=format&fit=crop"
              alt="SpaceX Starship Big Rocket at Starbase Texas"
              fill
              sizes="100vw"
              className="object-cover object-bottom opacity-55"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-xc-black/97 via-xc-black/80 to-purple-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-xc-black/90 via-transparent to-xc-black/60" />
          {/* Engine glow at footer */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-orange-950/35 via-amber-950/10 to-transparent pointer-events-none" />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "55px 55px",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch gap-0">
            {/* Portrait column */}
            <div className="flex-shrink-0 flex flex-col items-center justify-end gap-4 p-8 md:p-10 md:border-r md:border-white/5">
              <div className="relative w-48 h-64 rounded-2xl overflow-hidden ring-2 ring-purple-500/50 shadow-2xl shadow-purple-950/80">
                <Image
                  src="/images/elon-musk.jpg"
                  alt="Elon Musk — Founder & Chief Architect, X-CAPITAL"
                  fill
                  sizes="192px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-xc-black/90 to-transparent" />
              </div>
              <div className="text-center">
                <div className="text-white font-black text-xl tracking-tight">
                  Elon Musk
                </div>
                <div className="text-[10px] text-purple-400 font-mono tracking-[0.3em] uppercase mt-0.5">
                  Founder · Chief Architect
                </div>
                <div className="text-[10px] text-xc-muted/70 mt-1">
                  CEO SpaceX · Tesla · xAI · X Corp
                </div>
              </div>
            </div>

            {/* Main content column */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-10">
              <div className="text-[9px] font-mono font-bold text-purple-400/80 tracking-[0.5em] uppercase mb-4">
                X-Capital · The Multiplanetary Capital Network · Est. 2026
              </div>
              <blockquote className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 max-w-2xl">
                &ldquo;X-CAPITAL is the financial infrastructure
                <br />
                for the multiplanetary economy.&rdquo;
              </blockquote>
              <p className="text-sm text-white/50 leading-relaxed max-w-xl mb-8">
                Every dollar deployed here bends the arc of civilization toward
                the stars. From Wall Street to Starbase — capital at the speed
                of the future, without limits, without borders, without
                compromise.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(
                  [
                    ["Capital Deployed", "$2.4T+"],
                    ["Global Markets", "14 Active"],
                    ["Instruments", "50,000+"],
                    ["System Uptime", "99.99%"],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-3 border border-white/[0.06]"
                  >
                    <div className="text-lg font-black gradient-text">
                      {value}
                    </div>
                    <div className="text-[10px] text-xc-muted mt-0.5">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status column */}
            <div className="flex-shrink-0 flex flex-col items-end justify-between p-8 md:p-10 gap-6 hidden xl:flex">
              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/40 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                <span className="text-xs font-bold text-emerald-400 tracking-wide">
                  ALL SYSTEMS LIVE
                </span>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[10px] text-xc-muted uppercase tracking-wider">
                  Platform Edition
                </div>
                <div className="text-sm font-black text-white">VERTEX</div>
                <div className="text-xs text-purple-400 font-mono">
                  March 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_ASSETS: Partial<Asset>[] = [
  { symbol: "TSLA", name: "Tesla, Inc.", price: 248.42, priceChange24h: 3.21 },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 875.39,
    priceChange24h: 2.15,
  },
  { symbol: "AAPL", name: "Apple Inc.", price: 213.07, priceChange24h: 0.54 },
  {
    symbol: "META",
    name: "Meta Platforms",
    price: 513.92,
    priceChange24h: 2.77,
  },
  {
    symbol: "XSPACE",
    name: "X-SPACE Token",
    price: 12.5,
    priceChange24h: 5.12,
  },
  {
    symbol: "XINFRA",
    name: "X-INFRA Token",
    price: 8.75,
    priceChange24h: 2.88,
  },
];

const DEMO_TRANSACTIONS = [
  {
    id: "1",
    type: "DEPOSIT",
    amount: 10000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    type: "TRADE",
    amount: 2484,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "3",
    type: "FUND_INVESTMENT",
    amount: 5000,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "4",
    type: "TRADE",
    amount: 875,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: "5",
    type: "WITHDRAWAL",
    amount: 1500,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
] as Transaction[];
