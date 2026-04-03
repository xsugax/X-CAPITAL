"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStore } from "@/store/useStore";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  Shield, Users, Activity, DollarSign, TrendingUp, AlertTriangle,
  Eye, EyeOff, Lock, Unlock, Ban, CheckCircle, XCircle, Search,
  ChevronDown, ChevronRight, RefreshCw, Download, Upload,
  Globe, Server, Cpu, Database, Zap, BarChart3, FileText,
  Bell, Mail, Settings, Key, Layers, GitBranch, Terminal,
  Clock, Wallet, CreditCard, ArrowUpDown, Filter, MoreVertical,
  UserPlus, UserMinus, Edit3, Trash2, Copy, ExternalLink, Power,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA — God Admin operates on simulated platform-wide data
// ═══════════════════════════════════════════════════════════════════════════════

const DEMO_USERS = [
  { id: "u-001", name: "Demo Investor", email: "demo@xcapital.io", tier: "GOLD", role: "USER", kyc: "APPROVED", status: "active", balance: 124853, joined: "2025-06-15", lastLogin: "2026-04-03T08:22:00Z", trades: 347, country: "US" },
  { id: "u-002", name: "Sarah Chen", email: "sarah.chen@gmail.com", tier: "BLACK", role: "USER", kyc: "APPROVED", status: "active", balance: 2450000, joined: "2024-12-01", lastLogin: "2026-04-02T21:10:00Z", trades: 1289, country: "SG" },
  { id: "u-003", name: "Marcus Wright", email: "mwright@proton.me", tier: "CORE", role: "USER", kyc: "PENDING", status: "active", balance: 5200, joined: "2026-03-28", lastLogin: "2026-04-01T14:55:00Z", trades: 12, country: "GB" },
  { id: "u-004", name: "Elena Volkov", email: "elena.v@outlook.com", tier: "GOLD", role: "USER", kyc: "APPROVED", status: "suspended", balance: 89400, joined: "2025-02-14", lastLogin: "2026-03-15T09:30:00Z", trades: 456, country: "DE" },
  { id: "u-005", name: "James Okafor", email: "j.okafor@yahoo.com", tier: "CORE", role: "USER", kyc: "NOT_STARTED", status: "active", balance: 0, joined: "2026-04-02", lastLogin: "2026-04-02T23:45:00Z", trades: 0, country: "NG" },
  { id: "u-006", name: "Yuki Tanaka", email: "yuki.t@icloud.com", tier: "BLACK", role: "ADMIN", kyc: "APPROVED", status: "active", balance: 5800000, joined: "2024-08-20", lastLogin: "2026-04-03T07:00:00Z", trades: 2100, country: "JP" },
  { id: "u-007", name: "Platform Admin", email: "admin@xcapital.io", tier: "BLACK", role: "GOD_ADMIN", kyc: "APPROVED", status: "active", balance: 0, joined: "2024-01-01", lastLogin: "2026-04-03T09:00:00Z", trades: 0, country: "US" },
  { id: "u-008", name: "Priya Sharma", email: "priya.s@hotmail.com", tier: "GOLD", role: "USER", kyc: "REJECTED", status: "active", balance: 15000, joined: "2025-11-10", lastLogin: "2026-03-30T16:20:00Z", trades: 89, country: "IN" },
] as const;

const DEMO_TRANSACTIONS = [
  { id: "tx-001", user: "Sarah Chen", type: "TRADE", asset: "TSLA", amount: 125000, direction: "BUY", status: "filled", time: "2026-04-03T08:15:00Z", rail: "NASDAQ" },
  { id: "tx-002", user: "Demo Investor", type: "DEPOSIT", asset: "USD", amount: 50000, direction: "IN", status: "completed", time: "2026-04-03T07:45:00Z", rail: "ACH" },
  { id: "tx-003", user: "Yuki Tanaka", type: "TRADE", asset: "BTC", amount: 340000, direction: "BUY", status: "filled", time: "2026-04-03T07:30:00Z", rail: "BLOCKCHAIN" },
  { id: "tx-004", user: "Marcus Wright", type: "DEPOSIT", asset: "GBP", amount: 5200, direction: "IN", status: "pending", time: "2026-04-03T06:00:00Z", rail: "WIRE" },
  { id: "tx-005", user: "Elena Volkov", type: "WITHDRAWAL", asset: "EUR", amount: 25000, direction: "OUT", status: "flagged", time: "2026-04-02T22:00:00Z", rail: "SEPA" },
  { id: "tx-006", user: "Priya Sharma", type: "TRADE", asset: "NVDA", amount: 15000, direction: "SELL", status: "filled", time: "2026-04-02T20:30:00Z", rail: "NYSE" },
  { id: "tx-007", user: "Sarah Chen", type: "FUND_INVESTMENT", asset: "X-SPACE SPV", amount: 500000, direction: "BUY", status: "filled", time: "2026-04-02T18:00:00Z", rail: "SPV" },
  { id: "tx-008", user: "Demo Investor", type: "TRADE", asset: "ETH", amount: 8500, direction: "BUY", status: "filled", time: "2026-04-02T15:20:00Z", rail: "BLOCKCHAIN" },
] as const;

const SYSTEM_METRICS = {
  uptime: "99.97%",
  latency: "42ms",
  activeConnections: 1847,
  queueDepth: 12,
  cpuUsage: 34,
  memoryUsage: 61,
  diskUsage: 28,
  apiCalls24h: 2_450_000,
  errorRate: "0.03%",
  lastDeploy: "2026-04-02T14:30:00Z",
  version: "3.8.1",
  nodeCount: 12,
};

const COMPLIANCE_ALERTS = [
  { id: "ca-1", severity: "high", message: "Withdrawal >$20K flagged for Elena Volkov — manual review required", time: "2h ago", resolved: false },
  { id: "ca-2", severity: "medium", message: "KYC document expiry approaching for 14 users (30-day notice)", time: "6h ago", resolved: false },
  { id: "ca-3", severity: "low", message: "New jurisdiction registration: Nigeria (NG) — auto-screening enabled", time: "1d ago", resolved: true },
  { id: "ca-4", severity: "high", message: "Unusual login pattern detected: 3 failed attempts from unknown IP for j.okafor@yahoo.com", time: "1d ago", resolved: false },
  { id: "ca-5", severity: "medium", message: "AML threshold triggered: cumulative $1M+ in 30 days for Sarah Chen", time: "2d ago", resolved: true },
];

const AUDIT_LOG = [
  { time: "09:00:12", actor: "System", action: "Auto-backup completed", target: "Database", level: "info" },
  { time: "08:55:30", actor: "admin@xcapital.io", action: "Approved KYC", target: "Marcus Wright", level: "action" },
  { time: "08:22:00", actor: "demo@xcapital.io", action: "Logged in", target: "Session", level: "info" },
  { time: "07:45:15", actor: "System", action: "Rate limit triggered", target: "API /v1/orders", level: "warning" },
  { time: "07:30:00", actor: "yuki.t@icloud.com", action: "Placed order BTC $340K", target: "Trading Engine", level: "action" },
  { time: "06:15:00", actor: "System", action: "SSL certificate renewed", target: "*.xcapital.investments", level: "info" },
  { time: "05:00:00", actor: "Cron", action: "Nightly reconciliation passed", target: "Ledger", level: "success" },
  { time: "03:30:00", actor: "System", action: "Geo-block: sanctioned IP rejected", target: "Firewall", level: "warning" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "transactions", label: "Transactions", icon: ArrowUpDown },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "system", label: "System", icon: Server },
  { id: "audit", label: "Audit Log", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Access gate
  if (!user || (user.role !== "ADMIN" && user.role !== "GOD_ADMIN")) {
    return (
      <DashboardLayout title="Access Denied" subtitle="Insufficient privileges">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Shield className="w-16 h-16 text-red-500/40 mb-6" />
          <h2 className="text-2xl font-black text-white mb-2">God Admin Access Required</h2>
          <p className="text-xc-muted text-sm max-w-md">
            This control center requires GOD_ADMIN or ADMIN privileges.
            Log in with admin credentials to access platform controls.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="God Admin" subtitle="Platform Control Center">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                activeTab === id
                  ? "bg-xc-purple text-white shadow-lg shadow-purple-900/30"
                  : "text-xc-muted hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "compliance" && <ComplianceTab />}
        {activeTab === "system" && <SystemTab />}
        {activeTab === "audit" && <AuditTab />}
      </div>
    </DashboardLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════

function OverviewTab() {
  const totalAUM = DEMO_USERS.reduce((s, u) => s + u.balance, 0);
  const activeUsers = DEMO_USERS.filter((u) => u.status === "active").length;
  const pendingKYC = DEMO_USERS.filter((u) => u.kyc === "PENDING").length;
  const unresolvedAlerts = COMPLIANCE_ALERTS.filter((a) => !a.resolved).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Total AUM" value={formatCurrency(totalAUM)} change="+12.4%" positive />
        <KPICard icon={Users} label="Total Users" value={DEMO_USERS.length.toString()} change="+3 this week" positive />
        <KPICard icon={Activity} label="24h Volume" value={formatCurrency(1_063_500)} change="+8.2%" positive />
        <KPICard icon={AlertTriangle} label="Open Alerts" value={unresolvedAlerts.toString()} change={unresolvedAlerts > 0 ? "Action needed" : "All clear"} positive={unresolvedAlerts === 0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Health */}
          <AdminCard title="Platform Health" icon={Activity} badge="LIVE">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MiniStat label="Uptime" value={SYSTEM_METRICS.uptime} color="text-xc-green" />
              <MiniStat label="Latency" value={SYSTEM_METRICS.latency} color="text-xc-cyan" />
              <MiniStat label="Error Rate" value={SYSTEM_METRICS.errorRate} color="text-xc-green" />
              <MiniStat label="API Calls (24h)" value={(SYSTEM_METRICS.apiCalls24h / 1_000_000).toFixed(1) + "M"} color="text-white" />
            </div>
          </AdminCard>

          {/* Recent Transactions */}
          <AdminCard title="Recent Transactions" icon={ArrowUpDown} action="View All →">
            <div className="space-y-2">
              {DEMO_TRANSACTIONS.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      tx.direction === "BUY" || tx.direction === "IN" ? "bg-emerald-950/50 text-xc-green" : "bg-red-950/50 text-red-400"
                    )}>
                      {tx.direction === "BUY" || tx.direction === "IN" ? "↑" : "↓"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{tx.user}</div>
                      <div className="text-xs text-xc-muted">{tx.type} · {tx.asset} · {tx.rail}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">{formatCurrency(tx.amount)}</div>
                    <TxStatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* User Breakdown */}
          <AdminCard title="User Breakdown" icon={Users}>
            <div className="space-y-3">
              {[
                { label: "Active", count: activeUsers, total: DEMO_USERS.length, color: "bg-xc-green" },
                { label: "KYC Approved", count: DEMO_USERS.filter((u) => u.kyc === "APPROVED").length, total: DEMO_USERS.length, color: "bg-xc-purple" },
                { label: "KYC Pending", count: pendingKYC, total: DEMO_USERS.length, color: "bg-amber-500" },
                { label: "Suspended", count: DEMO_USERS.filter((u) => u.status === "suspended").length, total: DEMO_USERS.length, color: "bg-red-500" },
              ].map(({ label, count, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-xc-muted">{label}</span>
                    <span className="text-white font-bold">{count}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Compliance Alerts */}
          <AdminCard title="Compliance Alerts" icon={Shield} badge={unresolvedAlerts > 0 ? `${unresolvedAlerts} OPEN` : undefined}>
            <div className="space-y-2">
              {COMPLIANCE_ALERTS.filter((a) => !a.resolved).slice(0, 3).map((alert) => (
                <div key={alert.id} className={cn("px-3 py-2 rounded-lg border text-xs",
                  alert.severity === "high" ? "bg-red-950/30 border-red-900/30 text-red-300" :
                  alert.severity === "medium" ? "bg-amber-950/30 border-amber-900/30 text-amber-300" :
                  "bg-white/[0.03] border-white/[0.06] text-xc-muted"
                )}>
                  <div className="font-semibold mb-0.5">{alert.severity.toUpperCase()}</div>
                  <div className="text-[11px] leading-relaxed opacity-80">{alert.message}</div>
                  <div className="text-[10px] opacity-50 mt-1">{alert.time}</div>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Tier Distribution */}
          <AdminCard title="Tier Distribution" icon={Layers}>
            <div className="space-y-2">
              {(["CORE", "GOLD", "BLACK"] as const).map((tier) => {
                const count = DEMO_USERS.filter((u) => u.tier === tier).length;
                const colors = { CORE: "text-white bg-white/10", GOLD: "text-amber-400 bg-amber-500/20", BLACK: "text-purple-400 bg-purple-500/20" };
                return (
                  <div key={tier} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full", colors[tier])}>{tier}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{count} users</span>
                  </div>
                );
              })}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function UsersTab() {
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [filterKYC, setFilterKYC] = useState<string>("ALL");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return DEMO_USERS.filter((u) => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchTier = filterTier === "ALL" || u.tier === filterTier;
      const matchKYC = filterKYC === "ALL" || u.kyc === filterKYC;
      return matchSearch && matchTier && matchKYC;
    });
  }, [search, filterTier, filterKYC]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xc-muted" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-xc-card border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-xc-muted/50 focus:ring-1 focus:ring-xc-purple/50 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)}
            className="bg-xc-card border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
            <option value="ALL">All Tiers</option>
            <option value="CORE">Core</option>
            <option value="GOLD">Gold</option>
            <option value="BLACK">Black</option>
          </select>
          <select value={filterKYC} onChange={(e) => setFilterKYC(e.target.value)}
            className="bg-xc-card border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
            <option value="ALL">All KYC</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="NOT_STARTED">Not Started</option>
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-xc-muted">
        <span>{filtered.length} users found</span>
        <span>·</span>
        <span>Total AUM: <span className="text-white font-bold">{formatCurrency(filtered.reduce((s, u) => s + u.balance, 0))}</span></span>
      </div>

      {/* User rows */}
      <div className="bg-xc-card border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-bold text-xc-muted uppercase tracking-wider">
          <span>User</span>
          <span>Tier / Role</span>
          <span>KYC</span>
          <span>Balance</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filtered.map((u) => (
          <div key={u.id}>
            <div
              className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
              onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
            >
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-xc-purple to-xc-cyan flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{u.name.split(" ").map((n) => n[0]).join("")}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{u.name}</div>
                  <div className="text-xs text-xc-muted truncate">{u.email}</div>
                </div>
              </div>

              {/* Tier / Role */}
              <div className="hidden md:flex flex-col gap-1">
                <TierBadge tier={u.tier} />
                {u.role !== "USER" && <span className="text-[10px] font-mono text-red-400">{u.role}</span>}
              </div>

              {/* KYC */}
              <div className="hidden md:block">
                <KYCBadge status={u.kyc} />
              </div>

              {/* Balance */}
              <div className="hidden md:block text-sm font-mono font-bold text-white">
                {formatCurrency(u.balance)}
              </div>

              {/* Status */}
              <div className="hidden md:block">
                <StatusBadge status={u.status} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <ChevronDown className={cn("w-4 h-4 text-xc-muted transition-transform", expandedUser === u.id && "rotate-180")} />
              </div>
            </div>

            {/* Expanded Detail */}
            {expandedUser === u.id && (
              <div className="px-5 py-4 bg-black/20 border-b border-white/[0.06]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <DetailItem label="User ID" value={u.id} mono />
                  <DetailItem label="Country" value={u.country} />
                  <DetailItem label="Joined" value={new Date(u.joined).toLocaleDateString()} />
                  <DetailItem label="Last Login" value={timeAgo(u.lastLogin)} />
                  <DetailItem label="Total Trades" value={u.trades.toString()} />
                  <DetailItem label="Balance" value={formatCurrency(u.balance)} />
                  <DetailItem label="KYC Status" value={u.kyc.replace(/_/g, " ")} />
                  <DetailItem label="Role" value={u.role} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminBtn icon={Eye} label="View Profile" />
                  <AdminBtn icon={Edit3} label="Edit User" />
                  <AdminBtn icon={Key} label="Reset Password" />
                  <AdminBtn icon={CheckCircle} label="Approve KYC" variant="success" />
                  <AdminBtn icon={ArrowUpDown} label="Adjust Balance" />
                  <AdminBtn icon={Lock} label="Change Tier" />
                  {u.status === "active" ? (
                    <AdminBtn icon={Ban} label="Suspend" variant="danger" />
                  ) : (
                    <AdminBtn icon={Unlock} label="Reactivate" variant="success" />
                  )}
                  <AdminBtn icon={Trash2} label="Delete" variant="danger" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function TransactionsTab() {
  const [txFilter, setTxFilter] = useState("ALL");

  const filtered = txFilter === "ALL" ? DEMO_TRANSACTIONS : DEMO_TRANSACTIONS.filter((t) => t.type === txFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-xc-muted" />
          {["ALL", "TRADE", "DEPOSIT", "WITHDRAWAL", "FUND_INVESTMENT"].map((f) => (
            <button key={f} onClick={() => setTxFilter(f)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                txFilter === f ? "bg-xc-purple text-white" : "text-xc-muted hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
              )}>
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <AdminBtn icon={Download} label="Export CSV" />
          <AdminBtn icon={RefreshCw} label="Refresh" />
        </div>
      </div>

      <div className="bg-xc-card border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[80px_1.5fr_1fr_1fr_1fr_100px_80px] gap-3 px-5 py-3 border-b border-white/[0.06] text-xs font-bold text-xc-muted uppercase tracking-wider">
          <span>ID</span><span>User</span><span>Type</span><span>Asset / Rail</span><span>Amount</span><span>Status</span><span>Time</span>
        </div>
        {filtered.map((tx) => (
          <div key={tx.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[80px_1.5fr_1fr_1fr_1fr_100px_80px] gap-3 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] items-center">
            <span className="text-xs font-mono text-xc-muted hidden md:block">{tx.id}</span>
            <span className="text-sm font-semibold text-white">{tx.user}</span>
            <span className="hidden md:block text-xs text-xc-muted">{tx.type}</span>
            <div className="hidden md:block">
              <span className="text-sm text-white font-semibold">{tx.asset}</span>
              <span className="text-xs text-xc-muted ml-1.5">{tx.rail}</span>
            </div>
            <div className={cn("text-sm font-mono font-bold",
              tx.direction === "BUY" || tx.direction === "IN" ? "text-xc-green" : "text-red-400"
            )}>
              {tx.direction === "BUY" || tx.direction === "IN" ? "+" : "-"}{formatCurrency(tx.amount)}
            </div>
            <div className="hidden md:block"><TxStatusBadge status={tx.status} /></div>
            <span className="hidden md:block text-xs text-xc-muted">{timeAgo(tx.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ComplianceTab() {
  const [alerts, setAlerts] = useState(COMPLIANCE_ALERTS.map((a) => ({ ...a })));

  const resolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={AlertTriangle} label="Open Alerts" value={alerts.filter((a) => !a.resolved).length.toString()} change="Requires attention" positive={false} />
        <KPICard icon={Shield} label="KYC Pending" value={DEMO_USERS.filter((u) => u.kyc === "PENDING").length.toString()} change="Manual review" positive={false} />
        <KPICard icon={CheckCircle} label="KYC Approved" value={DEMO_USERS.filter((u) => u.kyc === "APPROVED").length.toString()} change="Compliant" positive />
        <KPICard icon={Globe} label="Jurisdictions" value="6" change="Auto-screening on" positive />
      </div>

      {/* Alerts */}
      <AdminCard title="Compliance Alerts" icon={AlertTriangle}>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={cn(
              "flex items-start gap-3 p-3 rounded-xl border transition-all",
              alert.resolved ? "bg-white/[0.02] border-white/[0.04] opacity-60" :
              alert.severity === "high" ? "bg-red-950/20 border-red-900/30" :
              alert.severity === "medium" ? "bg-amber-950/20 border-amber-900/30" :
              "bg-white/[0.03] border-white/[0.06]"
            )}>
              {alert.severity === "high" ? <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> :
               alert.severity === "medium" ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" /> :
               <Bell className="w-4 h-4 text-xc-muted flex-shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-bold uppercase",
                    alert.severity === "high" ? "text-red-400" : alert.severity === "medium" ? "text-amber-400" : "text-xc-muted"
                  )}>{alert.severity}</span>
                  <span className="text-[10px] text-xc-muted">{alert.time}</span>
                  {alert.resolved && <span className="text-[10px] text-xc-green font-bold">RESOLVED</span>}
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{alert.message}</p>
              </div>
              {!alert.resolved && (
                <button onClick={() => resolve(alert.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-xc-green/20 text-xc-green text-xs font-bold hover:bg-xc-green/30 transition-colors">
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </AdminCard>

      {/* AML / Sanctions Controls */}
      <AdminCard title="AML & Sanctions Controls" icon={Lock}>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Transaction Monitoring", desc: "Real-time screening on all transactions", enabled: true },
            { label: "Sanctions List Screening", desc: "OFAC, EU, UN consolidated lists", enabled: true },
            { label: "PEP Screening", desc: "Politically Exposed Persons database", enabled: true },
            { label: "Geo-blocking", desc: "Block sanctioned jurisdictions", enabled: true },
            { label: "Velocity Checks", desc: "Flag rapid successive transactions", enabled: true },
            { label: "Large Transaction Reports", desc: "Auto-file CTRs for >$10K", enabled: false },
          ].map((ctrl) => (
            <div key={ctrl.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <div className="text-sm font-semibold text-white">{ctrl.label}</div>
                <div className="text-xs text-xc-muted">{ctrl.desc}</div>
              </div>
              <ToggleSwitch defaultOn={ctrl.enabled} />
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM TAB
// ═══════════════════════════════════════════════════════════════════════════════

function SystemTab() {
  return (
    <div className="space-y-6">
      {/* Infrastructure Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Activity} label="Uptime" value={SYSTEM_METRICS.uptime} change="Last 30 days" positive />
        <KPICard icon={Zap} label="API Latency" value={SYSTEM_METRICS.latency} change="p99 percentile" positive />
        <KPICard icon={Server} label="Active Nodes" value={SYSTEM_METRICS.nodeCount.toString()} change="All healthy" positive />
        <KPICard icon={GitBranch} label="Version" value={`v${SYSTEM_METRICS.version}`} change={`Deployed ${timeAgo(SYSTEM_METRICS.lastDeploy)}`} positive />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resource Usage */}
        <AdminCard title="Resource Usage" icon={Cpu}>
          <div className="space-y-4">
            <ResourceBar label="CPU" value={SYSTEM_METRICS.cpuUsage} color="bg-xc-cyan" />
            <ResourceBar label="Memory" value={SYSTEM_METRICS.memoryUsage} color="bg-xc-purple" />
            <ResourceBar label="Disk" value={SYSTEM_METRICS.diskUsage} color="bg-xc-green" />
          </div>
        </AdminCard>

        {/* Services Status */}
        <AdminCard title="Services" icon={Server}>
          <div className="space-y-2">
            {[
              { name: "Trading Engine", status: "operational", latency: "12ms" },
              { name: "Order Router", status: "operational", latency: "8ms" },
              { name: "Auth Service", status: "operational", latency: "15ms" },
              { name: "Payment Gateway", status: "operational", latency: "95ms" },
              { name: "Blockchain Bridge", status: "operational", latency: "240ms" },
              { name: "AI Oracle", status: "degraded", latency: "450ms" },
              { name: "Notification Service", status: "operational", latency: "22ms" },
              { name: "KYC Provider", status: "operational", latency: "180ms" },
            ].map((svc) => (
              <div key={svc.name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", svc.status === "operational" ? "bg-xc-green" : "bg-amber-500 animate-pulse")} />
                  <span className="text-sm text-white">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-xc-muted">{svc.latency}</span>
                  <span className={cn("text-[10px] font-bold uppercase", svc.status === "operational" ? "text-xc-green" : "text-amber-400")}>
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Admin Controls */}
      <AdminCard title="Platform Controls" icon={Power}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: RefreshCw, label: "Restart Services", desc: "Rolling restart all microservices" },
            { icon: Database, label: "Database Backup", desc: "Trigger manual snapshot" },
            { icon: Terminal, label: "Run Migration", desc: "Execute pending DB migrations" },
            { icon: Download, label: "Export Data", desc: "Full platform data export" },
            { icon: Upload, label: "Import Config", desc: "Upload configuration bundle" },
            { icon: Lock, label: "Maintenance Mode", desc: "Enable platform-wide lockdown" },
          ].map(({ icon: Icon, label, desc }) => (
            <button key={label}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-xc-purple/30 transition-all text-left group">
              <Icon className="w-5 h-5 text-xc-muted group-hover:text-xc-purple-light flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white">{label}</div>
                <div className="text-xs text-xc-muted">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG TAB
// ═══════════════════════════════════════════════════════════════════════════════

function AuditTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-xc-muted">Showing last 24 hours of activity</p>
        <AdminBtn icon={Download} label="Export Audit Log" />
      </div>
      <div className="bg-xc-card border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[80px_1.5fr_2fr_1.5fr_60px] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-bold text-xc-muted uppercase tracking-wider">
          <span>Time</span><span>Actor</span><span>Action</span><span>Target</span><span>Level</span>
        </div>
        {AUDIT_LOG.map((entry, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] md:grid-cols-[80px_1.5fr_2fr_1.5fr_60px] gap-4 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] items-center">
            <span className="text-xs font-mono text-xc-muted">{entry.time}</span>
            <span className="text-sm text-white font-semibold">{entry.actor}</span>
            <span className="text-sm text-white/80">{entry.action}</span>
            <span className="hidden md:block text-xs text-xc-muted">{entry.target}</span>
            <span className={cn("text-[10px] font-bold uppercase",
              entry.level === "success" ? "text-xc-green" :
              entry.level === "warning" ? "text-amber-400" :
              entry.level === "action" ? "text-xc-purple-light" :
              "text-xc-muted"
            )}>{entry.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function KPICard({ icon: Icon, label, value, change, positive }: { icon: React.ElementType; label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="bg-xc-card border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-xc-muted" />
        <span className={cn("text-xs font-semibold", positive ? "text-xc-green" : "text-amber-400")}>{change}</span>
      </div>
      <div className="text-2xl font-black text-white mb-0.5">{value}</div>
      <div className="text-xs text-xc-muted">{label}</div>
    </div>
  );
}

function AdminCard({ title, icon: Icon, badge, action, children }: { title: string; icon: React.ElementType; badge?: string; action?: string; children: React.ReactNode }) {
  return (
    <div className="bg-xc-card border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-xc-purple-light" />
          <h3 className="font-bold text-white text-sm">{title}</h3>
          {badge && <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        {action && <button className="text-xs text-xc-purple-light hover:text-white transition-colors font-semibold">{action}</button>}
      </div>
      {children}
    </div>
  );
}

function AdminBtn({ icon: Icon, label, variant = "default" }: { icon: React.ElementType; label: string; variant?: "default" | "success" | "danger" }) {
  const colors = {
    default: "text-xc-muted hover:text-white hover:bg-white/[0.06] border-white/[0.08]",
    success: "text-xc-green hover:bg-emerald-950/40 border-emerald-800/30",
    danger: "text-red-400 hover:bg-red-950/40 border-red-800/30",
  };
  return (
    <button className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all", colors[variant])}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className={cn("text-lg font-black", color)}>{value}</div>
      <div className="text-xs text-xc-muted">{label}</div>
    </div>
  );
}

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-xc-muted uppercase tracking-wider font-semibold">{label}</div>
      <div className={cn("text-sm font-semibold text-white mt-0.5", mono && "font-mono text-xs")}>{value}</div>
    </div>
  );
}

function ResourceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-xc-muted">{label}</span>
        <span className={cn("font-bold", value > 80 ? "text-red-400" : value > 60 ? "text-amber-400" : "text-xc-green")}>{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={cn("relative w-11 h-6 rounded-full transition-colors flex-shrink-0", on ? "bg-xc-purple" : "bg-white/10")}>
      <div className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform", on && "translate-x-5")} />
    </button>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = { CORE: "bg-white/10 text-white", GOLD: "bg-amber-500/20 text-amber-400", BLACK: "bg-purple-500/20 text-purple-400" };
  return <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full", colors[tier] ?? colors.CORE)}>{tier}</span>;
}

function KYCBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    APPROVED: "text-xc-green", PENDING: "text-amber-400", REJECTED: "text-red-400", NOT_STARTED: "text-xc-muted",
  };
  return <span className={cn("text-xs font-semibold", colors[status] ?? "text-xc-muted")}>{status.replace(/_/g, " ")}</span>;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-semibold",
      status === "active" ? "text-xc-green" : "text-red-400"
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === "active" ? "bg-xc-green" : "bg-red-400")} />
      {status}
    </span>
  );
}

function TxStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    filled: "text-xc-green", completed: "text-xc-green", pending: "text-amber-400", flagged: "text-red-400",
  };
  return <span className={cn("text-[10px] font-bold uppercase", colors[status] ?? "text-xc-muted")}>{status}</span>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
