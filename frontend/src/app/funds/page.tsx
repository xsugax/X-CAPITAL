"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FundCard from "@/components/funds/FundCard";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Card";
import { fundsAPI, walletAPI } from "@/lib/api";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  TrendingUp,
  Lock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Target,
  Flame,
  Zap,
} from "lucide-react";
import type { Investment, UserInvestment } from "@/types";
import { useStore } from "@/store/useStore";

function generateAUMHistory(currentAUM: number) {
  const data = [];
  let v = currentAUM * 0.3;
  for (let i = 12; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    v *= 1 + (Math.random() - 0.35) * 0.12;
    if (v > currentAUM * 1.1) v = currentAUM * (0.9 + Math.random() * 0.15);
    data.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      aum: Math.round(v),
    });
  }
  return data;
}

function generateFundPerformance(funds: typeof DEMO_FUNDS) {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  return months.map((m) => {
    const entry: Record<string, string | number> = { month: m };
    funds.slice(0, 6).forEach((f) => {
      entry[(f.name ?? "Fund").split(" ").slice(0, 2).join(" ")] = Number(
        ((Math.random() - 0.3) * 15).toFixed(2),
      );
    });
    return entry;
  });
}

const FUND_COLORS = [
  "#7c3aed",
  "#06b6d4",
  "#d97706",
  "#10b981",
  "#ef4444",
  "#a78bfa",
];

export default function FundsPage() {
  const { wallet } = useStore();
  const [funds, setFunds] = useState<Investment[]>([]);
  const [myInvestments, setMyInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Investment | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [investing, setInvesting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [aumHistory, setAumHistory] = useState<
    Array<{ month: string; aum: number }>
  >([]);
  const [perfData, setPerfData] = useState<
    Array<Record<string, string | number>>
  >([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [fundsRes, myRes] = await Promise.allSettled([
          fundsAPI.getFunds(),
          fundsAPI.getMyInvestments(),
        ]);
        if (fundsRes.status === "fulfilled")
          setFunds(fundsRes.value.data.data.funds ?? []);
        else setFunds(DEMO_FUNDS as Investment[]);
        if (myRes.status === "fulfilled")
          setMyInvestments(myRes.value.data.data.investments ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayFunds = funds.length > 0 ? funds : (DEMO_FUNDS as Investment[]);

  useEffect(() => {
    const totalAUM = displayFunds.reduce(
      (s, f) => s + Number(f.currentAUM ?? 0),
      0,
    );
    setAumHistory(generateAUMHistory(totalAUM));
    setPerfData(generateFundPerformance(DEMO_FUNDS));
  }, [displayFunds.length]);

  // Live AUM drift
  useEffect(() => {
    const interval = setInterval(() => {
      setAumHistory((prev) =>
        prev.map((d, i) =>
          i === prev.length - 1
            ? { ...d, aum: d.aum * (1 + (Math.random() - 0.48) * 0.002) }
            : d,
        ),
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const openInvest = (fund: Investment) => {
    setSelected(fund);
    setInvestAmount(String(fund.minInvestment));
    setMessage(null);
  };

  const handleInvest = async () => {
    if (!selected) return;
    setInvesting(true);
    setMessage(null);
    try {
      await fundsAPI.invest(selected.id, parseFloat(investAmount));
      setMessage({
        type: "success",
        text: `Invested ${formatCurrency(parseFloat(investAmount))} in ${selected.name}`,
      });
      setTimeout(() => setSelected(null), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text: e.response?.data?.message ?? "Investment failed.",
      });
    } finally {
      setInvesting(false);
    }
  };

  const totalInvested = myInvestments.reduce((s, i) => s + Number(i.amount), 0);
  const totalAUM = displayFunds.reduce(
    (s, f) => s + Number(f.currentAUM ?? 0),
    0,
  );

  // Risk/Return scatter data
  const scatterData = displayFunds.map((f) => ({
    name: (f.name ?? "Fund").split(" ").slice(0, 2).join(" "),
    risk:
      f.riskLevel === "HIGH"
        ? 75 + Math.random() * 20
        : f.riskLevel === "MEDIUM"
          ? 35 + Math.random() * 25
          : 10 + Math.random() * 20,
    return: Number(f.targetReturn),
    aum: Number(f.currentAUM ?? 0),
  }));

  return (
    <DashboardLayout
      title="Funds &amp; SPVs"
      subtitle="Institutional-grade private investments · Live AUM tracking"
    >
      <div className="space-y-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Platform AUM"
            value={formatCurrency(totalAUM)}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard
            title="Your Deployed"
            value={formatCurrency(totalInvested)}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Active Positions"
            value={String(
              myInvestments.filter((i) => i.status === "ACTIVE").length,
            )}
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            title="Available Funds"
            value={String(displayFunds.length)}
            icon={<Lock className="w-5 h-5" />}
          />
        </div>

        {/* ── AUM Growth Chart (full width, tall) ── */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-white text-lg">
                Platform AUM Growth
              </h3>
              <p className="text-sm text-xc-muted mt-1">
                12-month assets under management · Live
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white font-mono">
                {formatCurrency(totalAUM)}
              </div>
              <div className="text-sm text-emerald-400 font-bold">
                +142% YoY
              </div>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={aumHistory}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <defs>
                  <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(Number(v ?? 0) / 1e6).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d0d1e",
                    border: "1px solid #1a1a3a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatCurrency(Number(v ?? 0)), "AUM"]}
                />
                <Area
                  type="monotone"
                  dataKey="aum"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fill="url(#aumGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Risk/Return Scatter + Fund Performance Comparison ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Risk vs Return Scatter */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-4 h-4 text-white/50" />
              <h3 className="font-black text-white text-base">Risk vs. Return</h3>
              <span className="text-xs text-xc-muted ml-auto">
                All funds
              </span>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <XAxis
                    type="number"
                    dataKey="risk"
                    name="Risk"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Risk Score",
                      position: "bottom",
                      fill: "#64748b",
                      fontSize: 10,
                      offset: -5,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="return"
                    name="Return"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Target Return %",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#64748b",
                      fontSize: 10,
                    }}
                  />
                  <ZAxis type="number" dataKey="aum" range={[40, 400]} />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d1e",
                      border: "1px solid #1a1a3a",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(v: number, name: string) => [
                      name === "Return"
                        ? `${v}%`
                        : name === "Risk"
                          ? Number(v ?? 0).toFixed(0)
                          : formatCurrency(Number(v ?? 0)),
                      name,
                    ]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.name ?? ""
                    }
                  />
                  <Scatter data={scatterData} fill="#7c3aed" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fund Performance Comparison */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-white/60" />
              <h3 className="font-black text-white text-base">
                Fund Performance Comparison
              </h3>
              <span className="text-xs text-xc-muted ml-auto">
                6 months
              </span>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={perfData}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d1e",
                      border: "1px solid #1a1a3a",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  {displayFunds.slice(0, 6).map((f, i) => (
                    <Bar
                      key={f.id}
                      dataKey={(f.name ?? "Fund").split(" ").slice(0, 2).join(" ")}
                      fill={FUND_COLORS[i]}
                      opacity={0.7}
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {displayFunds.slice(0, 6).map((f, i) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2 text-xs text-xc-muted"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: FUND_COLORS[i] }}
                  />
                  {(f.name ?? "Fund").split(" ").slice(0, 2).join(" ")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── My investments ── */}
        {myInvestments.length > 0 && (
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <h3 className="font-bold text-white mb-5 text-lg">
              My Investments
            </h3>
            <div className="space-y-3">
              {myInvestments.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-xc-dark/40 border border-xc-border/60"
                >
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {inv.investment?.name ?? "Fund"}
                    </div>
                    <div className="text-xs text-xc-muted mt-0.5">
                      {inv.maturesAt
                        ? `Matures ${new Date(inv.maturesAt).toLocaleDateString()}`
                        : "Active"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">
                      {formatCurrency(Number(inv.amount))}
                    </div>
                    <Badge
                      variant={inv.status === "ACTIVE" ? "success" : "warning"}
                      size="sm"
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Fund Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-white text-lg">Available Funds</h3>
            <span className="text-sm text-xc-muted">
              {displayFunds.length} funds open for investment
            </span>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-xc-card border border-xc-border animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayFunds.map((fund) => (
                <FundCard key={fund.id} fund={fund} onInvest={openInvest} />
              ))}
            </div>
          )}
        </div>

        {/* ── Accreditation note ── */}
        <div className="flex items-start gap-4 bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 text-sm">
          <AlertCircle className="w-5 h-5 text-white/50 shrink-0 mt-0.5" />
          <div>
            <span className="text-white/50 font-semibold">
              Accredited Investors Only.
            </span>
            <span className="text-xc-muted ml-2">
              These are Regulation D private securities offerings. Investments
              involve risk and are illiquid for the stated lock period. Past
              performance does not guarantee future results.
            </span>
          </div>
        </div>
      </div>

      {/* ── Invest modal ── */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Invest in ${selected?.name}`}
        subtitle="Private fund investment — illiquid during lock period"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-xc-dark/60 rounded-xl p-3">
                <div className="text-xs text-xc-muted mb-1">Target Return</div>
                <div className="text-lg font-black text-xc-green font-mono">
                  {formatPercent(Number(selected.targetReturn))}/yr
                </div>
              </div>
              <div className="bg-xc-dark/60 rounded-xl p-3">
                <div className="text-xs text-xc-muted mb-1">Lock Period</div>
                <div className="text-lg font-black text-white">
                  {selected.lockPeriodDays} days
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-xc-muted mb-1.5">
                Investment Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xc-muted font-mono">
                  $
                </span>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  min={Number(selected.minInvestment)}
                  step="100"
                  className="w-full bg-xc-dark/60 border border-xc-border rounded-xl pl-7 pr-4 py-3 text-sm font-mono text-white placeholder:text-xc-muted/50 focus:outline-none focus:border-xc-purple/60"
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5">
                <span className="text-xc-muted">
                  Min: {formatCurrency(Number(selected.minInvestment))}
                </span>
                <span className="text-xc-muted">
                  Available: {formatCurrency(Number(wallet?.fiatBalance ?? 0))}
                </span>
              </div>
            </div>
            {message && (
              <div
                className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${message.type === "success" ? "text-xc-green bg-emerald-950/30 border border-emerald-700/40" : "text-xc-red bg-red-950/30 border border-red-700/40"}`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {message.text}
              </div>
            )}
            <ModalFooter>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={investing}
                onClick={handleInvest}
                disabled={
                  parseFloat(investAmount) < Number(selected.minInvestment)
                }
              >
                Confirm Investment
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

const DEMO_FUNDS = [
  {
    id: "1",
    name: "X-SPACE Fund I",
    description:
      "Exposure to space infrastructure, satellite tech, and launch providers via SPV structure.",
    category: "SPACE",
    minInvestment: 25000,
    lockPeriodDays: 365,
    targetReturn: 22,
    currentAUM: 8500000,
    maxCapacity: 15000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
  {
    id: "2",
    name: "X-AI Infrastructure Fund",
    description:
      "Investment in AI data centers, GPU clusters, and cloud infrastructure supporting the next generation of AI.",
    category: "AI",
    minInvestment: 50000,
    lockPeriodDays: 730,
    targetReturn: 28,
    currentAUM: 42000000,
    maxCapacity: 100000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
  {
    id: "3",
    name: "X-ENERGY Systems Fund",
    description:
      "Diversified energy transition portfolio including solar, wind, and grid-scale storage projects.",
    category: "ENERGY",
    minInvestment: 10000,
    lockPeriodDays: 180,
    targetReturn: 14,
    currentAUM: 23000000,
    maxCapacity: 50000000,
    isOpen: true,
    riskLevel: "MEDIUM",
  },
  {
    id: "4",
    name: "X-Capital Late Stage Venture",
    description:
      "Series C/D technology venture investments with secondary liquidity options after 12 months.",
    category: "VENTURE",
    minInvestment: 100000,
    lockPeriodDays: 365,
    targetReturn: 35,
    currentAUM: 75000000,
    maxCapacity: 200000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
  {
    id: "5",
    name: "Starlink Growth SPV",
    description:
      "Direct exposure to SpaceX's Starlink division — the world's largest satellite internet constellation serving 5M+ subscribers across 105 countries.",
    category: "SPACE",
    minInvestment: 50000,
    lockPeriodDays: 730,
    targetReturn: 42,
    currentAUM: 120000000,
    maxCapacity: 500000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
  {
    id: "6",
    name: "xAI Frontier Fund",
    description:
      "Pre-IPO allocation in Elon Musk's xAI. Grok-4 is benchmarking above GPT-5. Memphis supercluster running 200,000 H100 GPUs.",
    category: "AI",
    minInvestment: 100000,
    lockPeriodDays: 1095,
    targetReturn: 65,
    currentAUM: 280000000,
    maxCapacity: 750000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
  {
    id: "7",
    name: "Neuralink BCI Fund",
    description:
      "Brain-computer interface venture exposure. FDA-approved N2 chip implanted in 8 patients. Thought-to-text at 62 WPM. IPO catalyst 2027.",
    category: "VENTURE",
    minInvestment: 75000,
    lockPeriodDays: 1095,
    targetReturn: 48,
    currentAUM: 45000000,
    maxCapacity: 150000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
  {
    id: "8",
    name: "Mars Colony Infrastructure Fund",
    description:
      "Long-horizon fund targeting Martian colonization supply chain — life support systems, ISRU mining, habitat construction, and transport logistics.",
    category: "SPACE",
    minInvestment: 250000,
    lockPeriodDays: 1825,
    targetReturn: 85,
    currentAUM: 18000000,
    maxCapacity: 100000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
  {
    id: "9",
    name: "Tesla Robotaxi & Optimus Fund",
    description:
      "Focused exposure to Tesla's autonomous driving fleet and Optimus humanoid robot program. FSD v13 achieving L4 in 12 cities.",
    category: "AI",
    minInvestment: 25000,
    lockPeriodDays: 365,
    targetReturn: 38,
    currentAUM: 95000000,
    maxCapacity: 300000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
  {
    id: "10",
    name: "Tesla Megapack Energy Grid",
    description:
      "Grid-scale energy storage deployments. Tesla Energy division growing 150% YoY. Contracts with utilities across 40 states and 12 countries.",
    category: "ENERGY",
    minInvestment: 15000,
    lockPeriodDays: 365,
    targetReturn: 19,
    currentAUM: 67000000,
    maxCapacity: 200000000,
    isOpen: true,
    riskLevel: "MEDIUM",
  },
  {
    id: "11",
    name: "Boring Company Transit SPV",
    description:
      "Underground hyperloop and transit tunnel ventures. Vegas Loop operational, LA-Vegas feasibility awarded. $4.2B in contracted projects.",
    category: "VENTURE",
    minInvestment: 50000,
    lockPeriodDays: 730,
    targetReturn: 25,
    currentAUM: 32000000,
    maxCapacity: 100000000,
    isOpen: true,
    riskLevel: "MEDIUM",
  },
  {
    id: "12",
    name: "X-DOGE Meme Economy Fund",
    description:
      "Structured exposure to Dogecoin ecosystem and meme asset class. Includes DOGE staking yields, Dogecoin merchant adoption plays, and social token derivatives.",
    category: "VENTURE",
    minInvestment: 5000,
    lockPeriodDays: 90,
    targetReturn: 55,
    currentAUM: 15000000,
    maxCapacity: 50000000,
    isOpen: true,
    riskLevel: "HIGH",
  },
];
