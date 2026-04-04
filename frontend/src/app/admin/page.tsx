"use client";

import { useState, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStore, AuditEntry } from "@/store/useStore";
import { cn, formatCurrency } from "@/lib/utils";
import type { User } from "@/types";
import {
  Shield,
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock,
  Ban,
  CheckCircle,
  Search,
  ChevronDown,
  RefreshCw,
  Download,
  Globe,
  Server,
  Cpu,
  Database,
  Zap,
  BarChart3,
  FileText,
  Layers,
  GitBranch,
  Terminal,
  Clock,
  UserPlus,
  Edit3,
  Trash2,
  Power,
  Snowflake,
  Play,
  Pause,
  TrendingDown,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC DATA (system metrics — these stay demo, no backend)
// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_METRICS = {
  uptime: "99.97%",
  latency: "42ms",
  activeConnections: 1847,
  cpuUsage: 34,
  memoryUsage: 61,
  diskUsage: 28,
  apiCalls24h: 2_450_000,
  errorRate: "0.03%",
  lastDeploy: "2026-04-02T14:30:00Z",
  version: "3.8.1",
  nodeCount: 12,
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "create", label: "Create User", icon: UserPlus },
  { id: "system", label: "System", icon: Server },
  { id: "audit", label: "Audit Log", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PAGE COMPONENT
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
          <h2 className="text-2xl font-black text-white mb-2">
            God Admin Access Required
          </h2>
          <p className="text-xc-muted text-sm max-w-md">
            This control center requires GOD_ADMIN or ADMIN privileges. Log in
            with admin credentials to access platform controls.
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
                  : "text-xc-muted hover:text-white hover:bg-white/[0.06]",
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
        {activeTab === "create" && <CreateUserTab />}
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
  const { registeredUsers, auditLog } = useStore();
  const users = registeredUsers || [];

  const totalAUM = users.reduce((s, u) => s + (u.balance || 0), 0);
  const activeUsers = users.filter(
    (u) => !u.isBlocked && !u.isSuspended,
  ).length;
  const frozenUsers = users.filter((u) => u.isFrozen).length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;
  const suspendedUsers = users.filter((u) => u.isSuspended).length;
  const tradingDisabled = users.filter((u) => !u.tradingEnabled).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={DollarSign}
          label="Total AUM"
          value={formatCurrency(totalAUM)}
          change={`${users.length} accounts`}
          positive
        />
        <KPICard
          icon={Users}
          label="Total Users"
          value={users.length.toString()}
          change={`${activeUsers} active`}
          positive
        />
        <KPICard
          icon={Activity}
          label="System Uptime"
          value={SYSTEM_METRICS.uptime}
          change={SYSTEM_METRICS.latency + " latency"}
          positive
        />
        <KPICard
          icon={AlertTriangle}
          label="Flagged"
          value={(blockedUsers + suspendedUsers + frozenUsers).toString()}
          change={blockedUsers > 0 ? "Action needed" : "All clear"}
          positive={blockedUsers === 0}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Health */}
          <AdminCard title="Platform Health" icon={Activity} badge="LIVE">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MiniStat
                label="Uptime"
                value={SYSTEM_METRICS.uptime}
                color="text-xc-green"
              />
              <MiniStat
                label="Latency"
                value={SYSTEM_METRICS.latency}
                color="text-xc-cyan"
              />
              <MiniStat
                label="Error Rate"
                value={SYSTEM_METRICS.errorRate}
                color="text-xc-green"
              />
              <MiniStat
                label="API Calls (24h)"
                value={
                  (SYSTEM_METRICS.apiCalls24h / 1_000_000).toFixed(1) + "M"
                }
                color="text-white"
              />
            </div>
          </AdminCard>

          {/* Recent Audit Events */}
          <AdminCard title="Recent Activity" icon={Clock}>
            <div className="space-y-2">
              {(auditLog || []).length === 0 ? (
                <p className="text-xc-muted text-sm py-4 text-center">
                  No audit entries yet. Admin actions will appear here.
                </p>
              ) : (
                (auditLog || []).slice(0, 8).map((entry, i) => (
                  <div
                    key={entry.id || i}
                    className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          entry.level === "danger"
                            ? "bg-red-500"
                            : entry.level === "warning"
                              ? "bg-amber-500"
                              : entry.level === "success"
                                ? "bg-xc-green"
                                : entry.level === "action"
                                  ? "bg-xc-purple"
                                  : "bg-white/20",
                        )}
                      />
                      <div>
                        <div className="text-sm text-white">{entry.action}</div>
                        <div className="text-xs text-xc-muted">
                          {entry.target} · by {entry.actor}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-xc-muted font-mono">
                      {entry.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* User Status */}
          <AdminCard title="User Status" icon={Users}>
            <div className="space-y-3">
              {[
                {
                  label: "Active",
                  count: activeUsers,
                  total: users.length,
                  color: "bg-xc-green",
                },
                {
                  label: "Frozen",
                  count: frozenUsers,
                  total: users.length,
                  color: "bg-cyan-400",
                },
                {
                  label: "Suspended",
                  count: suspendedUsers,
                  total: users.length,
                  color: "bg-amber-500",
                },
                {
                  label: "Blocked",
                  count: blockedUsers,
                  total: users.length,
                  color: "bg-red-500",
                },
                {
                  label: "Trading Off",
                  count: tradingDisabled,
                  total: users.length,
                  color: "bg-rose-500",
                },
              ].map(({ label, count, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-xc-muted">{label}</span>
                    <span className="text-white font-bold">
                      {count}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        color,
                      )}
                      style={{
                        width: total > 0 ? `${(count / total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Tier Distribution */}
          <AdminCard title="Tier Distribution" icon={Layers}>
            <div className="space-y-2">
              {(["CORE", "GOLD", "BLACK"] as const).map((tier) => {
                const count = users.filter((u) => u.tier === tier).length;
                const colors = {
                  CORE: "text-white bg-white/10",
                  GOLD: "text-amber-400 bg-amber-500/20",
                  BLACK: "text-purple-400 bg-purple-500/20",
                };
                return (
                  <div
                    key={tier}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
                        colors[tier],
                      )}
                    >
                      {tier}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {count} users
                    </span>
                  </div>
                );
              })}
            </div>
          </AdminCard>

          {/* Admin Powers Overview */}
          <AdminCard title="Admin Powers" icon={Shield}>
            <div className="space-y-2 text-xs">
              {[
                "Freeze / Unfreeze accounts",
                "Suspend / Reactivate users",
                "Block / Unblock permanently",
                "Start / Stop trading per user",
                "Increase / hold profits",
                "Set profit multiplier",
                "Adjust user balance",
                "Change tier & role",
                "Create / delete accounts",
                "Full audit trail",
              ].map((p) => (
                <div key={p} className="flex items-center gap-2 py-1">
                  <CheckCircle className="w-3 h-3 text-xc-green flex-shrink-0" />
                  <span className="text-xc-muted">{p}</span>
                </div>
              ))}
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
  const {
    registeredUsers,
    user: currentAdmin,
    updateUserById,
    deleteUserById,
    addAuditEntry,
  } = useStore();
  const users = registeredUsers || [];
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [balanceInput, setBalanceInput] = useState("");
  const [editingMultiplier, setEditingMultiplier] = useState<string | null>(
    null,
  );
  const [multiplierInput, setMultiplierInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const audit = useCallback(
    (action: string, target: string, level: AuditEntry["level"] = "action") => {
      addAuditEntry({
        id: `ae-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: new Date().toLocaleTimeString(),
        actor: currentAdmin?.email || "admin",
        action,
        target,
        level,
      });
    },
    [addAuditEntry, currentAdmin],
  );

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.firstName.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      if (filterStatus === "ALL") return matchSearch;
      if (filterStatus === "FROZEN") return matchSearch && u.isFrozen;
      if (filterStatus === "SUSPENDED") return matchSearch && u.isSuspended;
      if (filterStatus === "BLOCKED") return matchSearch && u.isBlocked;
      if (filterStatus === "TRADING_OFF")
        return matchSearch && !u.tradingEnabled;
      if (filterStatus === "ACTIVE")
        return matchSearch && !u.isBlocked && !u.isSuspended;
      return matchSearch;
    });
  }, [users, search, filterStatus]);

  const toggleFreeze = (u: User) => {
    updateUserById(u.id, { isFrozen: !u.isFrozen });
    audit(
      u.isFrozen ? "Unfroze account" : "Froze account",
      `${u.firstName} ${u.lastName}`,
      u.isFrozen ? "success" : "warning",
    );
    showToast(
      `${u.firstName} ${u.lastName} ${u.isFrozen ? "unfrozen" : "frozen"}`,
    );
  };
  const toggleSuspend = (u: User) => {
    updateUserById(u.id, { isSuspended: !u.isSuspended });
    audit(
      u.isSuspended ? "Reactivated account" : "Suspended account",
      `${u.firstName} ${u.lastName}`,
      u.isSuspended ? "success" : "warning",
    );
    showToast(
      `${u.firstName} ${u.lastName} ${u.isSuspended ? "reactivated" : "suspended"}`,
    );
  };
  const toggleBlock = (u: User) => {
    updateUserById(u.id, { isBlocked: !u.isBlocked });
    audit(
      u.isBlocked ? "Unblocked account" : "Blocked account",
      `${u.firstName} ${u.lastName}`,
      u.isBlocked ? "success" : "danger",
    );
    showToast(
      `${u.firstName} ${u.lastName} ${u.isBlocked ? "unblocked" : "blocked"}`,
    );
  };
  const toggleTrading = (u: User) => {
    updateUserById(u.id, { tradingEnabled: !u.tradingEnabled });
    audit(
      u.tradingEnabled ? "Stopped trading" : "Started trading",
      `${u.firstName} ${u.lastName}`,
      "action",
    );
    showToast(
      `Trading ${u.tradingEnabled ? "stopped" : "started"} for ${u.firstName}`,
    );
  };
  const toggleProfitHold = (u: User) => {
    updateUserById(u.id, { profitHold: !u.profitHold });
    audit(
      u.profitHold ? "Released profits" : "Held profits",
      `${u.firstName} ${u.lastName}`,
      "action",
    );
    showToast(
      `Profits ${u.profitHold ? "released" : "on hold"} for ${u.firstName}`,
    );
  };
  const saveBalance = (u: User) => {
    const val = parseFloat(balanceInput);
    if (isNaN(val) || val < 0) {
      showToast("Invalid balance");
      return;
    }
    updateUserById(u.id, { balance: val });
    audit(
      `Set balance to ${formatCurrency(val)}`,
      `${u.firstName} ${u.lastName}`,
      "action",
    );
    showToast(`Balance updated to ${formatCurrency(val)}`);
    setEditingBalance(null);
  };
  const saveMultiplier = (u: User) => {
    const val = parseFloat(multiplierInput);
    if (isNaN(val) || val < 0 || val > 100) {
      showToast("Invalid multiplier (0-100)");
      return;
    }
    updateUserById(u.id, { profitMultiplier: val });
    audit(
      `Set profit multiplier to ${val}x`,
      `${u.firstName} ${u.lastName}`,
      "action",
    );
    showToast(`Profit multiplier set to ${val}x`);
    setEditingMultiplier(null);
  };
  const changeTier = (u: User, tier: string) => {
    updateUserById(u.id, { tier: tier as User["tier"] });
    audit(`Changed tier to ${tier}`, `${u.firstName} ${u.lastName}`, "action");
    showToast(`Tier changed to ${tier}`);
  };
  const changeRole = (u: User, role: string) => {
    updateUserById(u.id, { role: role as User["role"] });
    audit(`Changed role to ${role}`, `${u.firstName} ${u.lastName}`, "warning");
    showToast(`Role changed to ${role}`);
  };
  const approveKYC = (u: User) => {
    updateUserById(u.id, { kycStatus: "APPROVED" });
    audit("Approved KYC", `${u.firstName} ${u.lastName}`, "success");
    showToast(`KYC approved for ${u.firstName}`);
  };
  const handleDelete = (u: User) => {
    deleteUserById(u.id);
    audit(
      "Deleted account",
      `${u.firstName} ${u.lastName} (${u.email})`,
      "danger",
    );
    showToast(`Account deleted: ${u.email}`);
    setConfirmDelete(null);
    setExpandedUser(null);
  };

  return (
    <div className="space-y-4 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-xc-purple text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl shadow-purple-900/50 animate-reveal-up">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xc-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-xc-card border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-xc-muted/50 focus:ring-1 focus:ring-xc-purple/50 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            "ALL",
            "ACTIVE",
            "FROZEN",
            "SUSPENDED",
            "BLOCKED",
            "TRADING_OFF",
          ].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                filterStatus === f
                  ? "bg-xc-purple text-white"
                  : "text-xc-muted hover:text-white bg-white/[0.04]",
              )}
            >
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-xc-muted">
        {filtered.length} user{filtered.length !== 1 ? "s" : ""} · Total AUM:{" "}
        <span className="text-white font-bold">
          {formatCurrency(filtered.reduce((s, u) => s + (u.balance || 0), 0))}
        </span>
      </div>

      {/* Users List */}
      <div className="bg-xc-card border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.06] text-xs font-bold text-xc-muted uppercase tracking-wider">
          <span>User</span>
          <span>Status</span>
          <span>Tier / Role</span>
          <span>Balance</span>
          <span>Trading</span>
          <span>Joined</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xc-muted text-sm">
            No users found.
          </div>
        ) : (
          filtered.map((u) => (
            <div key={u.id}>
              {/* User row */}
              <div
                className="grid grid-cols-[1fr_auto] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
                onClick={() =>
                  setExpandedUser(expandedUser === u.id ? null : u.id)
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-xc-purple to-xc-cyan flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {u.firstName[0]}
                      {u.lastName[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-xc-muted truncate">
                      {u.email}
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex flex-wrap gap-1">
                  {u.isBlocked && (
                    <MicroBadge color="bg-red-500/20 text-red-400">
                      BLOCKED
                    </MicroBadge>
                  )}
                  {u.isSuspended && !u.isBlocked && (
                    <MicroBadge color="bg-amber-500/20 text-amber-400">
                      SUSPENDED
                    </MicroBadge>
                  )}
                  {u.isFrozen && (
                    <MicroBadge color="bg-cyan-500/20 text-cyan-400">
                      FROZEN
                    </MicroBadge>
                  )}
                  {!u.isBlocked && !u.isSuspended && !u.isFrozen && (
                    <MicroBadge color="bg-emerald-500/20 text-xc-green">
                      ACTIVE
                    </MicroBadge>
                  )}
                </div>
                <div className="hidden lg:flex flex-col gap-0.5">
                  <TierBadge tier={u.tier} />
                  {u.role !== "USER" && (
                    <span className="text-[10px] font-mono text-red-400">
                      {u.role}
                    </span>
                  )}
                </div>
                <div className="hidden lg:block text-sm font-mono font-bold text-white">
                  {formatCurrency(u.balance || 0)}
                </div>
                <div className="hidden lg:block">
                  {u.tradingEnabled ? (
                    <span className="text-xs text-xc-green font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3" /> ON
                    </span>
                  ) : (
                    <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                      <Pause className="w-3 h-3" /> OFF
                    </span>
                  )}
                </div>
                <div className="hidden lg:block text-xs text-xc-muted">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-xc-muted transition-transform lg:hidden",
                    expandedUser === u.id && "rotate-180",
                  )}
                />
              </div>

              {/* Expanded Control Panel */}
              {expandedUser === u.id && (
                <div className="px-5 py-5 bg-black/30 border-b border-white/[0.06]">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    <DetailItem label="User ID" value={u.id} mono />
                    <DetailItem label="Email" value={u.email} />
                    <DetailItem
                      label="KYC"
                      value={(u.kycStatus || "NOT_STARTED").replace(/_/g, " ")}
                    />
                    <DetailItem
                      label="Last Login"
                      value={u.lastLogin ? timeAgo(u.lastLogin) : "Never"}
                    />
                    <DetailItem label="Trades" value={String(u.trades || 0)} />
                    <DetailItem label="Country" value={u.country || "N/A"} />
                    <DetailItem
                      label="Profit Multiplier"
                      value={`${u.profitMultiplier || 1}x`}
                    />
                    <DetailItem
                      label="Profits"
                      value={u.profitHold ? "ON HOLD" : "RELEASING"}
                    />
                  </div>

                  {/* Admin Power Controls */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <AdminBtn
                        icon={Snowflake}
                        label={u.isFrozen ? "Unfreeze" : "Freeze"}
                        onClick={() => toggleFreeze(u)}
                        variant={u.isFrozen ? "success" : "default"}
                      />
                      <AdminBtn
                        icon={u.isSuspended ? Unlock : Lock}
                        label={u.isSuspended ? "Reactivate" : "Suspend"}
                        onClick={() => toggleSuspend(u)}
                        variant={u.isSuspended ? "success" : "danger"}
                      />
                      <AdminBtn
                        icon={Ban}
                        label={u.isBlocked ? "Unblock" : "Block"}
                        onClick={() => toggleBlock(u)}
                        variant={u.isBlocked ? "success" : "danger"}
                      />
                      <AdminBtn
                        icon={u.tradingEnabled ? Pause : Play}
                        label={
                          u.tradingEnabled ? "Stop Trading" : "Start Trading"
                        }
                        onClick={() => toggleTrading(u)}
                        variant={u.tradingEnabled ? "danger" : "success"}
                      />
                      <AdminBtn
                        icon={u.profitHold ? TrendingUp : TrendingDown}
                        label={
                          u.profitHold ? "Release Profits" : "Hold Profits"
                        }
                        onClick={() => toggleProfitHold(u)}
                        variant={u.profitHold ? "success" : "default"}
                      />
                      {u.kycStatus !== "APPROVED" && (
                        <AdminBtn
                          icon={CheckCircle}
                          label="Approve KYC"
                          onClick={() => approveKYC(u)}
                          variant="success"
                        />
                      )}
                    </div>

                    {/* Balance Control */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-xc-muted font-semibold w-20">
                        Balance:
                      </span>
                      {editingBalance === u.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={balanceInput}
                            onChange={(e) => setBalanceInput(e.target.value)}
                            className="w-40 bg-xc-dark border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:ring-1 focus:ring-xc-purple/50 focus:outline-none"
                          />
                          <button
                            onClick={() => saveBalance(u)}
                            className="px-3 py-1.5 rounded-lg bg-xc-green/20 text-xc-green text-xs font-bold hover:bg-xc-green/30"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingBalance(null)}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xc-muted text-xs font-bold hover:bg-white/[0.08]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-white">
                            {formatCurrency(u.balance || 0)}
                          </span>
                          <button
                            onClick={() => {
                              setEditingBalance(u.id);
                              setBalanceInput(String(u.balance || 0));
                            }}
                            className="text-xs text-xc-purple-light hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Profit Multiplier */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-xc-muted font-semibold w-20">
                        Profit ×:
                      </span>
                      {editingMultiplier === u.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            value={multiplierInput}
                            onChange={(e) => setMultiplierInput(e.target.value)}
                            className="w-28 bg-xc-dark border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:ring-1 focus:ring-xc-purple/50 focus:outline-none"
                          />
                          <button
                            onClick={() => saveMultiplier(u)}
                            className="px-3 py-1.5 rounded-lg bg-xc-green/20 text-xc-green text-xs font-bold hover:bg-xc-green/30"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMultiplier(null)}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xc-muted text-xs font-bold hover:bg-white/[0.08]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-white">
                            {u.profitMultiplier || 1}x
                          </span>
                          <button
                            onClick={() => {
                              setEditingMultiplier(u.id);
                              setMultiplierInput(
                                String(u.profitMultiplier || 1),
                              );
                            }}
                            className="text-xs text-xc-purple-light hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tier & Role selects */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-xc-muted font-semibold">
                          Tier:
                        </span>
                        <select
                          value={u.tier}
                          onChange={(e) => changeTier(u, e.target.value)}
                          className="bg-xc-dark border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="CORE">CORE</option>
                          <option value="GOLD">GOLD</option>
                          <option value="BLACK">BLACK</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-xc-muted font-semibold">
                          Role:
                        </span>
                        <select
                          value={u.role || "USER"}
                          onChange={(e) => changeRole(u, e.target.value)}
                          className="bg-xc-dark border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="GOD_ADMIN">GOD_ADMIN</option>
                        </select>
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="pt-3 border-t border-white/[0.06]">
                      {confirmDelete === u.id ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-red-400 font-semibold">
                            Permanently delete this account?
                          </span>
                          <button
                            onClick={() => handleDelete(u)}
                            className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-4 py-1.5 rounded-lg bg-white/[0.06] text-xc-muted text-xs font-bold hover:bg-white/[0.1]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <AdminBtn
                          icon={Trash2}
                          label="Delete Account"
                          onClick={() => setConfirmDelete(u.id)}
                          variant="danger"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE USER TAB
// ═══════════════════════════════════════════════════════════════════════════════

function CreateUserTab() {
  const { createUserAsAdmin, user: admin, addAuditEntry } = useStore();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "USER",
    tier: "CORE",
  });
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setResult({ success: false, message: "All fields are required." });
      return;
    }
    if (form.password.length < 6) {
      setResult({
        success: false,
        message: "Password must be at least 6 characters.",
      });
      return;
    }
    setLoading(true);
    const res = await createUserAsAdmin(form);
    setLoading(false);
    if (res.success) {
      addAuditEntry({
        id: `ae-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        actor: admin?.email || "admin",
        action: `Created account for ${form.firstName} ${form.lastName}`,
        target: form.email,
        level: "success",
      });
      setResult({ success: true, message: `Account created: ${form.email}` });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "USER",
        tier: "CORE",
      });
    } else {
      setResult({
        success: false,
        message: res.error || "Failed to create account.",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <AdminCard title="Create New Account" icon={UserPlus}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-xc-muted mb-1">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="w-full bg-xc-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-xc-purple/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-xc-muted mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-xc-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-xc-purple/50 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-xc-muted mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-xc-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-xc-purple/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-xc-muted mb-1">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-xc-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-xc-purple/50 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-xc-muted mb-1">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-xc-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="GOD_ADMIN">GOD_ADMIN</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-xc-muted mb-1">
                Tier
              </label>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="w-full bg-xc-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="CORE">CORE</option>
                <option value="GOLD">GOLD</option>
                <option value="BLACK">BLACK</option>
              </select>
            </div>
          </div>
          {result && (
            <div
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-semibold",
                result.success
                  ? "bg-emerald-950/40 text-xc-green border border-emerald-800/30"
                  : "bg-red-950/40 text-red-400 border border-red-800/30",
              )}
            >
              {result.message}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-xc-purple hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Activity}
          label="Uptime"
          value={SYSTEM_METRICS.uptime}
          change="Last 30 days"
          positive
        />
        <KPICard
          icon={Zap}
          label="API Latency"
          value={SYSTEM_METRICS.latency}
          change="p99 percentile"
          positive
        />
        <KPICard
          icon={Server}
          label="Active Nodes"
          value={SYSTEM_METRICS.nodeCount.toString()}
          change="All healthy"
          positive
        />
        <KPICard
          icon={GitBranch}
          label="Version"
          value={`v${SYSTEM_METRICS.version}`}
          change={`Deployed ${timeAgo(SYSTEM_METRICS.lastDeploy)}`}
          positive
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <AdminCard title="Resource Usage" icon={Cpu}>
          <div className="space-y-4">
            <ResourceBar
              label="CPU"
              value={SYSTEM_METRICS.cpuUsage}
              color="bg-xc-cyan"
            />
            <ResourceBar
              label="Memory"
              value={SYSTEM_METRICS.memoryUsage}
              color="bg-xc-purple"
            />
            <ResourceBar
              label="Disk"
              value={SYSTEM_METRICS.diskUsage}
              color="bg-xc-green"
            />
          </div>
        </AdminCard>
        <AdminCard title="Services" icon={Server}>
          <div className="space-y-2">
            {[
              {
                name: "Trading Engine",
                status: "operational",
                latency: "12ms",
              },
              { name: "Auth Service", status: "operational", latency: "15ms" },
              {
                name: "Payment Gateway",
                status: "operational",
                latency: "95ms",
              },
              {
                name: "Blockchain Bridge",
                status: "operational",
                latency: "240ms",
              },
              { name: "AI Oracle", status: "degraded", latency: "450ms" },
              {
                name: "Notification Service",
                status: "operational",
                latency: "22ms",
              },
              { name: "KYC Provider", status: "operational", latency: "180ms" },
            ].map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      svc.status === "operational"
                        ? "bg-xc-green"
                        : "bg-amber-500 animate-pulse",
                    )}
                  />
                  <span className="text-sm text-white">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-xc-muted">
                    {svc.latency}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase",
                      svc.status === "operational"
                        ? "text-xc-green"
                        : "text-amber-400",
                    )}
                  >
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
      <AdminCard title="Platform Controls" icon={Power}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              icon: RefreshCw,
              label: "Restart Services",
              desc: "Rolling restart all microservices",
            },
            {
              icon: Database,
              label: "Database Backup",
              desc: "Trigger manual snapshot",
            },
            {
              icon: Terminal,
              label: "Run Migration",
              desc: "Execute pending DB migrations",
            },
            {
              icon: Download,
              label: "Export Data",
              desc: "Full platform data export",
            },
            {
              icon: Lock,
              label: "Maintenance Mode",
              desc: "Enable platform-wide lockdown",
            },
            {
              icon: Globe,
              label: "Sync All Users",
              desc: "Force-sync all user sessions",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-xc-purple/30 transition-all text-left group"
            >
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
  const { auditLog } = useStore();
  const entries = auditLog || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-xc-muted">
          {entries.length} audit entries recorded
        </p>
      </div>
      <div className="bg-xc-card border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[80px_1.5fr_2fr_1.5fr_60px] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-bold text-xc-muted uppercase tracking-wider">
          <span>Time</span>
          <span>Actor</span>
          <span>Action</span>
          <span>Target</span>
          <span>Level</span>
        </div>
        {entries.length === 0 ? (
          <div className="py-12 text-center text-xc-muted text-sm">
            No audit entries yet. Perform admin actions to see them here.
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.id || i}
              className="grid grid-cols-[1fr_auto] md:grid-cols-[80px_1.5fr_2fr_1.5fr_60px] gap-4 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] items-center"
            >
              <span className="text-xs font-mono text-xc-muted">
                {entry.time}
              </span>
              <span className="text-sm text-white font-semibold">
                {entry.actor}
              </span>
              <span className="text-sm text-white/80">{entry.action}</span>
              <span className="hidden md:block text-xs text-xc-muted">
                {entry.target}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase",
                  entry.level === "success"
                    ? "text-xc-green"
                    : entry.level === "warning"
                      ? "text-amber-400"
                      : entry.level === "danger"
                        ? "text-red-400"
                        : entry.level === "action"
                          ? "text-xc-purple-light"
                          : "text-xc-muted",
                )}
              >
                {entry.level}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function KPICard({
  icon: Icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-xc-card border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-xc-muted" />
        <span
          className={cn(
            "text-xs font-semibold",
            positive ? "text-xc-green" : "text-amber-400",
          )}
        >
          {change}
        </span>
      </div>
      <div className="text-2xl font-black text-white mb-0.5">{value}</div>
      <div className="text-xs text-xc-muted">{label}</div>
    </div>
  );
}

function AdminCard({
  title,
  icon: Icon,
  badge,
  children,
}: {
  title: string;
  icon: React.ElementType;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-xc-card border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-xc-purple-light" />
          <h3 className="font-bold text-white text-sm">{title}</h3>
          {badge && (
            <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function AdminBtn({
  icon: Icon,
  label,
  variant = "default",
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  variant?: "default" | "success" | "danger";
  onClick?: () => void;
}) {
  const colors = {
    default:
      "text-xc-muted hover:text-white hover:bg-white/[0.06] border-white/[0.08]",
    success: "text-xc-green hover:bg-emerald-950/40 border-emerald-800/30",
    danger: "text-red-400 hover:bg-red-950/40 border-red-800/30",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
        colors[variant],
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={cn("text-lg font-black", color)}>{value}</div>
      <div className="text-xs text-xc-muted">{label}</div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] text-xc-muted uppercase tracking-wider font-semibold">
        {label}
      </div>
      <div
        className={cn(
          "text-sm font-semibold text-white mt-0.5",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ResourceBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-xc-muted">{label}</span>
        <span
          className={cn(
            "font-bold",
            value > 80
              ? "text-red-400"
              : value > 60
                ? "text-amber-400"
                : "text-xc-green",
          )}
        >
          {value}%
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MicroBadge({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", color)}
    >
      {children}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    CORE: "bg-white/10 text-white",
    GOLD: "bg-amber-500/20 text-amber-400",
    BLACK: "bg-purple-500/20 text-purple-400",
  };
  return (
    <span
      className={cn(
        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
        colors[tier] ?? colors.CORE,
      )}
    >
      {tier}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
