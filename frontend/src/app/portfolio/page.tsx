"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/Card";
import PortfolioChart from "@/components/portfolio/PortfolioChart";
import HoldingsList from "@/components/portfolio/HoldingsList";
import { portfolioAPI } from "@/lib/api";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, DollarSign, Percent, ShieldCheck } from "lucide-react";
import type { Portfolio } from "@/types";

const PIE_COLORS = [
  "#7c3aed",
  "#06b6d4",
  "#d97706",
  "#10b981",
  "#ef4444",
  "#a78bfa",
  "#6366f1",
];

function generatePerfData(tv: number) {
  const data = [];
  let v = tv * 0.72;
  const now = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    v *= 1 + (Math.random() - 0.47) * 0.025;
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(v * 100) / 100,
    });
  }
  return data;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [perfData, setPerfData] = useState<
    Array<{ date: string; value: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await portfolioAPI.getPortfolio();
        setPortfolio(res.data.data);
        setPerfData(generatePerfData(res.data.data.totalValue || 10000));
      } catch {
        const demo: Portfolio = {
          id: "1",
          userId: "1",
          totalValue: 124800,
          totalCost: 98200,
          totalPnL: 26600,
          cashBalance: 22500,
          riskScore: 42,
          performanceYTD: 27.1,
          holdings: DEMO_HOLDINGS,
        };
        setPortfolio(demo);
        setPerfData(generatePerfData(124800));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const pnlPct =
    portfolio && portfolio.totalCost > 0
      ? (portfolio.totalPnL / portfolio.totalCost) * 100
      : 0;

  // Allocation from holdings
  const allocationData = portfolio?.holdings?.length
    ? portfolio.holdings.map((h) => ({
        name: h.asset?.symbol ?? "Unknown",
        value: Math.round(Number(h.currentValue)),
      }))
    : DEMO_ALLOCATION;

  return (
    <DashboardLayout
      title="Portfolio"
      subtitle="Performance, holdings &amp; allocation"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Value"
            value={formatCurrency(portfolio?.totalValue ?? 0)}
            change={pnlPct}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard
            title="Total P&L"
            value={formatCurrency(portfolio?.totalPnL ?? 0)}
            change={pnlPct}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="YTD Return"
            value={formatPercent(portfolio?.performanceYTD ?? 0)}
            change={portfolio?.performanceYTD ?? 0}
            icon={<Percent className="w-5 h-5" />}
          />
          <StatCard
            title="Risk Score"
            value={`${portfolio?.riskScore ?? 42}/100`}
            subtitle={riskLabel(portfolio?.riskScore ?? 42)}
            icon={<ShieldCheck className="w-5 h-5" />}
          />
        </div>

        {/* Chart */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
          <h3 className="font-bold text-white mb-6">Performance History</h3>
          <PortfolioChart data={perfData} height={240} />
        </div>

        {/* Holdings + Allocation */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-xc-card border border-xc-border rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Holdings</h3>
            <HoldingsList
              holdings={portfolio?.holdings ?? []}
              loading={loading}
            />
          </div>

          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Allocation</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v)]}
                    contentStyle={{
                      background: "#0d0d1e",
                      border: "1px solid #1a1a3a",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {allocationData.slice(0, 6).map((item, i) => {
                const total = allocationData.reduce((s, d) => s + d.value, 0);
                const pct = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xc-muted">{item.name}</span>
                    </div>
                    <span className="font-mono text-white">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function riskLabel(score: number) {
  if (score < 30) return "Conservative";
  if (score < 55) return "Moderate";
  if (score < 75) return "Aggressive";
  return "High Risk";
}

const DEMO_HOLDINGS = [
  {
    id: "1",
    portfolioId: "1",
    assetId: "1",
    quantity: 10,
    avgCost: 198.5,
    currentValue: 2484.2,
    unrealizedPnL: 504.2,
    asset: {
      id: "1",
      symbol: "TSLA",
      name: "Tesla, Inc.",
      type: "STOCK" as const,
      price: 248.42,
      isTradable: true,
    },
  },
  {
    id: "2",
    portfolioId: "1",
    assetId: "2",
    quantity: 2,
    avgCost: 750.0,
    currentValue: 1750.78,
    unrealizedPnL: 250.78,
    asset: {
      id: "2",
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      type: "STOCK" as const,
      price: 875.39,
      isTradable: true,
    },
  },
  {
    id: "3",
    portfolioId: "1",
    assetId: "3",
    quantity: 5,
    avgCost: 195.2,
    currentValue: 1065.35,
    unrealizedPnL: 89.35,
    asset: {
      id: "3",
      symbol: "AAPL",
      name: "Apple Inc.",
      type: "STOCK" as const,
      price: 213.07,
      isTradable: true,
    },
  },
  {
    id: "4",
    portfolioId: "1",
    assetId: "4",
    quantity: 100,
    avgCost: 10.2,
    currentValue: 1250.0,
    unrealizedPnL: 230.0,
    asset: {
      id: "4",
      symbol: "XSPACE",
      name: "X-SPACE Token",
      type: "TOKEN" as const,
      price: 12.5,
      isTradable: true,
    },
  },
];

const DEMO_ALLOCATION = [
  { name: "TSLA", value: 2484 },
  { name: "NVDA", value: 1750 },
  { name: "AAPL", value: 1065 },
  { name: "XSPACE", value: 1250 },
  { name: "Cash", value: 22500 },
];
