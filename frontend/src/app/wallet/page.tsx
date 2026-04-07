"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/Card";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { walletAPI } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Building2,
  CreditCard,
  Wallet,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { WalletTransaction } from "@/types";
import { useStore } from "@/store/useStore";

type ModalType = "deposit" | "withdraw" | null;
type DepositTab = "wire" | "crypto";

// ─── Supported cryptocurrencies ───────────────────────────────────────────────
const CRYPTOS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    network: "Bitcoin Network",
    grad: "from-orange-500 to-amber-400",
    text: "text-orange-400",
    ring: "ring-orange-500/40",
    rate: 68420,
    min: "0.0001 BTC",
    confs: 2,
    time: "~20 min",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    tag: "",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    network: "Ethereum (ERC-20)",
    grad: "from-blue-500 to-indigo-500",
    text: "text-blue-400",
    ring: "ring-blue-500/40",
    rate: 3840,
    min: "0.01 ETH",
    confs: 12,
    time: "~3 min",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7cd9E7B3C0",
    tag: "",
  },
  {
    symbol: "USDT",
    name: "Tether",
    network: "TRON (TRC-20)",
    grad: "from-teal-500 to-emerald-500",
    text: "text-teal-400",
    ring: "ring-teal-500/40",
    rate: 1.0,
    min: "10 USDT",
    confs: 1,
    time: "~1 min",
    address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    tag: "",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    network: "Ethereum (ERC-20)",
    grad: "from-blue-400 to-cyan-500",
    text: "text-cyan-400",
    ring: "ring-cyan-500/40",
    rate: 1.0,
    min: "10 USDC",
    confs: 12,
    time: "~3 min",
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFtb21eF9e0c8d27Ef",
    tag: "",
  },
  {
    symbol: "SOL",
    name: "Solana",
    network: "Solana Network",
    grad: "from-purple-500 to-violet-500",
    text: "text-violet-400",
    ring: "ring-violet-500/40",
    rate: 182,
    min: "0.1 SOL",
    confs: 1,
    time: "<1 min",
    address: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV",
    tag: "",
  },
  {
    symbol: "BNB",
    name: "BNB",
    network: "BNB Chain (BEP-20)",
    grad: "from-yellow-500 to-amber-400",
    text: "text-yellow-400",
    ring: "ring-yellow-500/40",
    rate: 428,
    min: "0.05 BNB",
    confs: 15,
    time: "~2 min",
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFtb21eF9e0c2d47Ab",
    tag: "",
  },
  {
    symbol: "XRP",
    name: "XRP",
    network: "XRP Ledger",
    grad: "from-slate-400 to-slate-300",
    text: "text-slate-300",
    ring: "ring-slate-400/40",
    rate: 0.62,
    min: "20 XRP",
    confs: 1,
    time: "<30 sec",
    address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    tag: "2847361",
  },
];

// ─── Exchanges where you can buy crypto ──────────────────────────────────────
const EXCHANGES = [
  {
    name: "Coinbase",
    tagline: "Best for beginners · US-regulated · FDIC insured fiat",
    badge: "RECOMMENDED",
    badgeClass: "text-emerald-400 bg-emerald-950/60 border-emerald-700/40",
    fee: "0.5 – 4.5%",
    link: "https://coinbase.com",
    coins: ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP"],
  },
  {
    name: "Binance",
    tagline: "World's largest exchange · Industry-lowest maker fees",
    badge: "MOST VOLUME",
    badgeClass: "text-amber-400 bg-amber-950/60 border-amber-700/40",
    fee: "0.10%",
    link: "https://binance.com",
    coins: ["BTC", "ETH", "USDT", "USDC", "SOL", "BNB", "XRP"],
  },
  {
    name: "Kraken",
    tagline: "Institutional-grade security · SOC 2 Type II certified",
    badge: "INSTITUTIONAL",
    badgeClass: "text-purple-400 bg-purple-950/60 border-purple-700/40",
    fee: "0.16 – 0.26%",
    link: "https://kraken.com",
    coins: ["BTC", "ETH", "USDT", "SOL", "XRP"],
  },
  {
    name: "OKX",
    tagline: "Advanced trading · High limits · 100+ countries",
    badge: "HIGH LIMITS",
    badgeClass: "text-blue-400 bg-blue-950/60 border-blue-700/40",
    fee: "0.08%",
    link: "https://okx.com",
    coins: ["BTC", "ETH", "USDT", "USDC", "SOL", "BNB", "XRP"],
  },
  {
    name: "Gemini",
    tagline: "NY-licensed · SOC 1/2 · Zero fees on Active Trader",
    badge: "MOST SECURE",
    badgeClass: "text-cyan-400 bg-cyan-950/60 border-cyan-700/40",
    fee: "0.03%",
    link: "https://gemini.com",
    coins: ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP"],
  },
];

const TX_ICONS: Record<string, JSX.Element> = {
  DEPOSIT: <ArrowDownLeft className="w-4 h-4 text-xc-green" />,
  WITHDRAWAL: <ArrowUpRight className="w-4 h-4 text-xc-red" />,
  TRADE: <BarChart3 className="w-4 h-4 text-xc-purple-light" />,
  FUND_INVESTMENT: <BarChart3 className="w-4 h-4 text-amber-400" />,
  FUND_REDEMPTION: <ArrowDownLeft className="w-4 h-4 text-xc-green" />,
  FEE: <ArrowUpRight className="w-4 h-4 text-xc-muted" />,
};

const TX_COLOR: Record<string, string> = {
  DEPOSIT: "text-xc-green",
  WITHDRAWAL: "text-xc-red",
  FUND_REDEMPTION: "text-xc-green",
};

export default function WalletPage() {
  const { wallet, setWallet } = useStore();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [depositTab, setDepositTab] = useState<DepositTab>("wire");
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTOS[0]);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [walletRes, txRes] = await Promise.allSettled([
          walletAPI.getWallet(),
          walletAPI.getTransactions({ limit: 20 }),
        ]);
        if (walletRes.status === "fulfilled")
          setWallet(walletRes.value.data.data);
        if (txRes.status === "fulfilled") {
          const txs = txRes.value.data.data.transactions ?? [];
          setTransactions(txs.length > 0 ? txs : DEMO_TRANSACTIONS);
        } else {
          setTransactions(DEMO_TRANSACTIONS);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setWallet]);

  const openModal = (type: ModalType, tab: DepositTab = "wire") => {
    setModal(type);
    setDepositTab(tab);
    setAmount("");
    setMessage(null);
    setCopied(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWithdraw = async () => {
    setProcessing(true);
    setMessage(null);
    const parsedAmount = parseFloat(amount);
    try {
      await walletAPI.withdraw(parsedAmount, "default");
      setMessage({
        type: "success",
        text: `Withdrawal of ${formatCurrency(parsedAmount)} initiated. Funds arrive in 1-2 business days.`,
      });
      const walletRes = await walletAPI.getWallet();
      setWallet(walletRes.data.data);
      setTimeout(() => setModal(null), 2200);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text:
          e.response?.data?.message ?? "Transaction failed. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const cash = Number(wallet?.fiatBalance ?? 247500);
  const locked = Number(wallet?.lockedBalance ?? 52300);
  const displayTx = transactions.length > 0 ? transactions : DEMO_TRANSACTIONS;

  // Balance history data
  const balanceHistory = useMemo(() => {
    const data = [];
    let v = cash * 0.4;
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      v *= 1 + (Math.random() - 0.42) * 0.04;
      data.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        balance: Math.round(v),
      });
    }
    return data;
  }, [cash]);

  // Monthly inflow/outflow data
  const flowData = useMemo(() => {
    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    return months.map((m) => ({
      month: m,
      inflow: Math.round(Math.random() * 80000 + 20000),
      outflow: Math.round(Math.random() * 40000 + 5000),
    }));
  }, []);

  // Transaction type breakdown
  const txBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    displayTx.forEach((tx) => {
      counts[tx.type] = (counts[tx.type] || 0) + Number(tx.amount);
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value: Math.round(value),
    }));
  }, [displayTx]);

  const TX_PIE_COLORS = [
    "#10b981",
    "#ef4444",
    "#7c3aed",
    "#d97706",
    "#06b6d4",
    "#a78bfa",
  ];

  return (
    <DashboardLayout
      title="Wallet"
      subtitle="Balances, deposits &amp; withdrawals — live tracking"
    >
      <div className="space-y-8">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Cash"
            value={formatCurrency(cash)}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard
            title="Total Deposited"
            value={formatCurrency(cash + locked + 180000)}
            icon={<ArrowDownLeft className="w-5 h-5" />}
          />
          <StatCard
            title="Locked in Orders"
            value={formatCurrency(locked)}
            subtitle="In active positions"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="YTD Return"
            value="+$48,320"
            subtitle="+22.4% this year"
            icon={<BarChart3 className="w-5 h-5" />}
          />
        </div>

        {/* ── Balance History + Inflow/Outflow + Tx Breakdown Charts ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Balance History Chart */}
          <div className="lg:col-span-2 bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white">Balance History</h3>
              </div>
              <span className="text-[10px] text-xc-muted">30 days</span>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={balanceHistory}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d1e",
                      border: "1px solid #1a1a3a",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [formatCurrency(v), "Balance"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#balGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Type Breakdown Pie */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white">Tx Breakdown</h3>
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={txBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {txBreakdown.map((_, i) => (
                      <Cell
                        key={i}
                        fill={TX_PIE_COLORS[i % TX_PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d1e",
                      border: "1px solid #1a1a3a",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(v: number) => [formatCurrency(v)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-3">
              {txBreakdown.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: TX_PIE_COLORS[i % TX_PIE_COLORS.length],
                      }}
                    />
                    <span className="text-xc-muted capitalize">
                      {item.name.toLowerCase()}
                    </span>
                  </div>
                  <span className="font-mono text-white">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Monthly Inflow / Outflow ── */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white">Monthly Cash Flow</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xc-muted">Inflow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xc-muted">Outflow</span>
              </div>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={flowData}
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
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d0d1e",
                    border: "1px solid #1a1a3a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatCurrency(v)]}
                />
                <Bar
                  dataKey="inflow"
                  fill="#10b981"
                  opacity={0.7}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="outflow"
                  fill="#ef4444"
                  opacity={0.7}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Funding Methods ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bank Wire */}
          <div
            className="bg-xc-card border border-xc-border rounded-2xl p-5 flex flex-col gap-3 hover:border-purple-500/40 transition-colors cursor-pointer group"
            onClick={() => openModal("deposit", "wire")}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-purple-400 bg-purple-950/60 border-purple-700/40">
                WIRE TRANSFER
              </span>
            </div>
            <div>
              <div className="font-bold text-white group-hover:text-purple-200 transition-colors">
                Bank / Wire Transfer
              </div>
              <div className="text-xs text-xc-muted mt-1">
                SWIFT · SEPA · ACH — $10 min · 1–3 business days · No fee above
                $10k
              </div>
            </div>
          </div>

          {/* Cryptocurrency */}
          <div
            className="bg-xc-card border border-amber-500/30 rounded-2xl p-5 flex flex-col gap-3 hover:border-amber-400/60 transition-colors cursor-pointer group relative overflow-hidden"
            onClick={() => openModal("deposit", "crypto")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-amber-400 bg-amber-950/60 border-amber-700/40 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> INSTANT
              </span>
            </div>
            <div>
              <div className="font-bold text-white group-hover:text-amber-200 transition-colors">
                Cryptocurrency
              </div>
              <div className="text-xs text-xc-muted mt-1">
                BTC · ETH · USDT · USDC · SOL · BNB · XRP — instant confirmation
                · no conversion fee
              </div>
            </div>
          </div>

          {/* Debit / Credit Card — coming soon */}
          <div className="bg-xc-card border border-xc-border rounded-2xl p-5 flex flex-col gap-3 opacity-60 cursor-not-allowed">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-xc-muted bg-white/5 border-xc-border">
                COMING SOON
              </span>
            </div>
            <div>
              <div className="font-bold text-white/60">Debit / Credit Card</div>
              <div className="text-xs text-xc-muted mt-1">
                Visa · Mastercard — instant · 2.9% fee · $50k daily limit
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => openModal("deposit")}
            icon={<ArrowDownLeft className="w-4 h-4" />}
          >
            Deposit Funds
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => openModal("withdraw")}
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            Withdraw
          </Button>
        </div>

        {/* ── Transaction History ── */}
        <div className="bg-xc-card border border-xc-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-xc-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Transaction History</h3>
              <p className="text-xs text-xc-muted mt-0.5">
                All deposits, withdrawals &amp; trades
              </p>
            </div>
            <Badge variant="default" size="sm">
              {displayTx.length} records
            </Badge>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-xc-border/50">
            <span className="text-xs text-xc-muted uppercase tracking-wider">
              Type
            </span>
            <span className="text-xs text-xc-muted uppercase tracking-wider">
              Description
            </span>
            <span className="text-xs text-xc-muted uppercase tracking-wider text-right">
              Amount
            </span>
            <span className="text-xs text-xc-muted uppercase tracking-wider text-right">
              Status
            </span>
            <span className="text-xs text-xc-muted uppercase tracking-wider text-right">
              Date
            </span>
          </div>
          <div>
            {displayTx.map((tx, i) => (
              <div
                key={tx.id || i}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 items-center border-b border-xc-border/20 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  {TX_ICONS[tx.type] ?? (
                    <BarChart3 className="w-4 h-4 text-xc-muted" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {String(
                      tx.metadata?.description ?? tx.type.replace(/_/g, " "),
                    )}
                  </div>
                  {tx.reference && (
                    <div className="text-xs text-xc-muted font-mono">
                      {tx.reference}
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-mono font-bold text-right",
                    TX_COLOR[tx.type] ?? "text-white",
                  )}
                >
                  {TX_COLOR[tx.type] === "text-xc-red" ? "−" : "+"}
                  {formatCurrency(Number(tx.amount))}
                </span>
                <Badge
                  variant={
                    tx.status === "COMPLETED"
                      ? "success"
                      : tx.status === "FAILED"
                        ? "danger"
                        : "warning"
                  }
                  size="sm"
                >
                  {tx.status}
                </Badge>
                <span className="text-xs text-xc-muted text-right whitespace-nowrap">
                  {tx.createdAt
                    ? new Date(tx.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Deposit Modal ── */}
      <Modal
        open={modal === "deposit"}
        onClose={() => setModal(null)}
        title="Deposit Funds"
        subtitle="Choose your preferred funding method"
        size="xl"
      >
        <div className="space-y-5">
          {/* Tab switcher */}
          <div className="flex gap-2 bg-xc-dark/60 p-1 rounded-xl border border-xc-border">
            <button
              onClick={() => setDepositTab("wire")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2",
                depositTab === "wire"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-xc-muted hover:text-white",
              )}
            >
              <Building2 className="w-4 h-4" /> Bank / Wire
            </button>
            <button
              onClick={() => setDepositTab("crypto")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2",
                depositTab === "crypto"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-xc-muted hover:text-white",
              )}
            >
              <Wallet className="w-4 h-4" /> Cryptocurrency
              <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                INSTANT
              </span>
            </button>
          </div>

          {/* ── Wire Tab ── */}
          {depositTab === "wire" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-xc-muted mb-1.5">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xc-muted font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full bg-xc-dark/60 border border-xc-border rounded-xl pl-7 pr-4 py-3 text-sm font-mono text-white placeholder:text-xc-muted/50 focus:outline-none focus:border-xc-purple/60"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {[10000, 25000, 50000, 100000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-xc-muted hover:text-white transition-all"
                  >
                    {formatCurrency(v)}
                  </button>
                ))}
              </div>
              <div className="bg-xc-dark/60 border border-xc-border rounded-xl p-4 space-y-2.5">
                <div className="text-xs font-bold text-xc-muted uppercase tracking-wider mb-3">
                  Wire Instructions
                </div>
                {(
                  [
                    ["Bank Name", "JPMorgan Chase Bank, N.A."],
                    ["Account Name", "X-Capital Management LLC"],
                    ["Account Number", "4782910385627"],
                    ["Routing (ABA)", "021000021"],
                    ["SWIFT / BIC", "CHASUS33"],
                    ["Bank Address", "383 Madison Ave, New York, NY 10017"],
                    [
                      "Reference",
                      "XCAP-" +
                        Math.random()
                          .toString(36)
                          .substring(2, 9)
                          .toUpperCase(),
                    ],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between text-xs gap-4"
                  >
                    <span className="text-xc-muted shrink-0">{label}</span>
                    <span className="text-white font-mono text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-950/20 border border-amber-700/20 rounded-xl px-3 py-2">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Include your reference code in the wire memo. Funds are credited
                within 1-3 business days after confirmation.
              </div>
            </div>
          )}

          {/* ── Crypto Tab ── */}
          {depositTab === "crypto" && (
            <div className="space-y-4">
              {/* Coin selector */}
              <div className="grid grid-cols-7 gap-1.5">
                {CRYPTOS.map((c) => (
                  <button
                    key={c.symbol}
                    onClick={() => {
                      setSelectedCrypto(c);
                      setCopied(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-bold transition-all",
                      selectedCrypto.symbol === c.symbol
                        ? `bg-gradient-to-br ${c.grad} border-transparent text-white shadow-lg scale-105`
                        : "bg-white/5 border-xc-border text-xc-muted hover:text-white hover:border-white/20",
                    )}
                  >
                    {c.symbol}
                  </button>
                ))}
              </div>

              {/* Selected coin panel */}
              <div
                className={cn(
                  "rounded-2xl border p-4 space-y-4 transition-all",
                  selectedCrypto.ring,
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={cn("text-lg font-black", selectedCrypto.text)}
                    >
                      {selectedCrypto.name}
                    </div>
                    <div className="text-xs text-xc-muted">
                      {selectedCrypto.network}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-xc-muted uppercase tracking-wider">
                      Current Rate
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      {selectedCrypto.rate >= 1
                        ? formatCurrency(selectedCrypto.rate)
                        : `$${selectedCrypto.rate}`}{" "}
                      / {selectedCrypto.symbol}
                    </div>
                  </div>
                </div>

                {/* Address + QR side by side */}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="text-xs text-xc-muted font-semibold uppercase tracking-wider">
                      Deposit Address
                    </div>
                    <div className="bg-xc-dark/80 border border-xc-border rounded-xl p-3 font-mono text-xs text-white break-all leading-relaxed select-all">
                      {selectedCrypto.address}
                    </div>
                    {selectedCrypto.tag && (
                      <div className="bg-amber-950/40 border border-amber-700/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-amber-400 font-semibold">
                          MEMO / TAG Required
                        </span>
                        <span className="font-mono text-xs text-white font-bold">
                          {selectedCrypto.tag}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={copyAddress}
                      className={cn(
                        "w-full py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2",
                        copied
                          ? "bg-emerald-950/40 border-emerald-700/40 text-emerald-400"
                          : "bg-white/5 border-xc-border text-xc-muted hover:text-white hover:border-white/20",
                      )}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Address Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Address
                        </>
                      )}
                    </button>
                  </div>
                  {/* QR code */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="text-xs text-xc-muted">Scan to Deposit</div>
                    <div className="bg-white p-2 rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(selectedCrypto.address)}`}
                        alt={`${selectedCrypto.symbol} QR code`}
                        width={120}
                        height={120}
                        className="rounded block"
                      />
                    </div>
                  </div>
                </div>

                {/* Network info grid */}
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      ["Min Deposit", selectedCrypto.min],
                      ["Confirmations", String(selectedCrypto.confs)],
                      ["Est. Time", selectedCrypto.time],
                      ["Network", selectedCrypto.network.split(" (")[0]],
                    ] as [string, string][]
                  ).map(([label, val]) => (
                    <div
                      key={label}
                      className="bg-xc-dark/60 rounded-xl p-2.5 text-center"
                    >
                      <div className="text-[10px] text-xc-muted mb-1">
                        {label}
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Where to buy */}
              <div>
                <div className="text-xs font-bold text-xc-muted uppercase tracking-wider mb-2.5">
                  Where to Buy {selectedCrypto.symbol}
                </div>
                <div className="space-y-2">
                  {EXCHANGES.filter((ex) =>
                    ex.coins.includes(selectedCrypto.symbol),
                  ).map((ex) => (
                    <a
                      key={ex.name}
                      href={ex.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-xc-dark/60 border border-xc-border hover:border-white/20 rounded-xl px-4 py-3 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black text-white">
                          {ex.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {ex.name}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
                                ex.badgeClass,
                              )}
                            >
                              {ex.badge}
                            </span>
                          </div>
                          <div className="text-xs text-xc-muted">
                            {ex.tagline}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-xc-muted">
                            Maker Fee
                          </div>
                          <div className="text-xs font-mono text-white font-semibold">
                            {ex.fee}
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-xc-muted group-hover:text-white transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModal(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Withdraw Modal ── */}
      <Modal
        open={modal === "withdraw"}
        onClose={() => setModal(null)}
        title="Withdraw Funds"
        subtitle="Transfer funds to your verified bank account"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-xc-muted mb-1.5">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xc-muted font-mono">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full bg-xc-dark/60 border border-xc-border rounded-xl pl-7 pr-4 py-3 text-sm font-mono text-white placeholder:text-xc-muted/50 focus:outline-none focus:border-xc-purple/60"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[5000, 10000, 25000, 50000].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-xc-muted hover:text-white transition-all"
              >
                {formatCurrency(v)}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center text-xs bg-xc-dark/40 border border-xc-border/60 rounded-xl p-3">
            <span className="text-xc-muted">Available balance</span>
            <span className="text-white font-semibold font-mono">
              {formatCurrency(cash)}
            </span>
          </div>
          <div className="bg-xc-dark/40 border border-xc-border/60 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-xc-muted uppercase tracking-wider mb-2">
              Destination Account
            </div>
            {(
              [
                ["Bank", "JPMorgan Chase  ••••  8291"],
                ["Processing Time", "1–2 business days"],
                ["Fee", "None (GOLD tier benefit)"],
                ["SWIFT", "CHASUS33"],
              ] as [string, string][]
            ).map(([l, v]) => (
              <div key={l} className="flex justify-between text-xs">
                <span className="text-xc-muted">{l}</span>
                <span className="text-white font-mono">{v}</span>
              </div>
            ))}
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
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              loading={processing}
              onClick={handleWithdraw}
              disabled={!parseFloat(amount) || parseFloat(amount) <= 0}
            >
              Withdraw Funds
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

const D = { userId: "demo-user", walletId: "demo-wallet" };
const DEMO_TRANSACTIONS: WalletTransaction[] = [
  {
    ...D,
    id: "1",
    type: "DEPOSIT",
    amount: 50000,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reference: "WIRE-2026-001",
    metadata: { description: "Wire transfer — JPMorgan Chase" },
  },
  {
    ...D,
    id: "2",
    type: "DEPOSIT",
    amount: 24850,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    reference: "CRYPTO-BTC-002",
    metadata: { description: "Bitcoin deposit — 0.3634 BTC" },
  },
  {
    ...D,
    id: "3",
    type: "TRADE",
    amount: 8750,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    reference: "TRD-003",
    metadata: { description: "BUY 35× NVDA @ $875.39" },
  },
  {
    ...D,
    id: "4",
    type: "FUND_INVESTMENT",
    amount: 25000,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    reference: "FND-004",
    metadata: { description: "Quantum Alpha Fund — subscription" },
  },
  {
    ...D,
    id: "5",
    type: "TRADE",
    amount: 4320,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    reference: "TRD-005",
    metadata: { description: "BUY 10× TSLA @ $432.10" },
  },
  {
    ...D,
    id: "6",
    type: "WITHDRAWAL",
    amount: 15000,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    reference: "WDR-006",
    metadata: { description: "ACH withdrawal — Chase ••••8291" },
  },
  {
    ...D,
    id: "7",
    type: "DEPOSIT",
    amount: 100000,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    reference: "WIRE-2026-007",
    metadata: { description: "Wire transfer — Morgan Stanley" },
  },
  {
    ...D,
    id: "8",
    type: "TRADE",
    amount: 1252,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    reference: "TRD-008",
    metadata: { description: "SELL 5× AAPL @ $250.42" },
  },
  {
    ...D,
    id: "9",
    type: "FUND_REDEMPTION",
    amount: 8400,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 777600000).toISOString(),
    reference: "FND-009",
    metadata: { description: "Orbital Income Fund — redemption +12.4%" },
  },
  {
    ...D,
    id: "10",
    type: "FEE",
    amount: 200,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    reference: "FEE-010",
    metadata: { description: "Monthly platform fee — GOLD tier" },
  },
  {
    ...D,
    id: "11",
    type: "DEPOSIT",
    amount: 5000,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 950400000).toISOString(),
    reference: "CRYPTO-ETH-011",
    metadata: { description: "Ethereum deposit — 1.302 ETH" },
  },
  {
    ...D,
    id: "12",
    type: "TRADE",
    amount: 6240,
    status: "PENDING",
    createdAt: new Date(Date.now() - 36000000).toISOString(),
    reference: "TRD-012",
    metadata: { description: "BUY 200× SPY @ $624.00 — pending" },
  },
];
