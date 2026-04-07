"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore, AuditEntry } from "@/store/useStore";
import { cn, formatCurrency } from "@/lib/utils";
import type { User, Transaction } from "@/types";
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  Lock,
  Unlock,
  Ban,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Clock,
  UserPlus,
  Edit3,
  Trash2,
  Power,
  Snowflake,
  Play,
  Pause,
  X,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Percent,
  Activity,
  Eye,
  LogOut,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
   X-CAPITAL — GOD ADMIN PANEL (Standalone)
   Completely separate from broker dashboard. Own layout & auth.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Tiny ID helper ──────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

// ── Toast ───────────────────────────────────────────────────────────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-blue-600";

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] ${bg} text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Modal Shell ─────────────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
  width = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className={`${width} w-full bg-[#0f0f14] border border-white/10 rounded-2xl shadow-2xl`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-[#12121a] border border-white/5 rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminPage() {
  const router = useRouter();
  const {
    user: currentUser,
    isAuthenticated,
    registeredUsers,
    updateUserById,
    deleteUserById,
    createUserAsAdmin,
    addAuditEntry,
    auditLog,
    logout,
  } = useStore();

  // ── Auth gate ─────────────────────────────────────────────────────────────
  const isAdmin =
    isAuthenticated &&
    currentUser &&
    (currentUser.role === "GOD_ADMIN" || currentUser.role === "ADMIN");

  // ── State ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "audit" | "create">(
    "users",
  );
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // ── Fund / Debit Modal ────────────────────────────────────────────────────
  const [fundModal, setFundModal] = useState<{
    userId: string;
    mode: "fund" | "debit";
  } | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundNote, setFundNote] = useState("");

  // ── Edit Modal ────────────────────────────────────────────────────────────
  const [editModal, setEditModal] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tier: "CORE" as string,
    country: "",
  });

  // ── Profit Config Modal ───────────────────────────────────────────────────
  const [profitModal, setProfitModal] = useState<User | null>(null);
  const [profitForm, setProfitForm] = useState({
    profitRate: 1.5,
    profitMode: "linear" as string,
    profitSchedule: "daily" as string,
    profitMultiplier: 1,
  });

  // ── Backdate Modal ────────────────────────────────────────────────────────
  const [backdateModal, setBackdateModal] = useState<User | null>(null);
  const [backdateValue, setBackdateValue] = useState("");

  // ── Create User Form ──────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "USER",
    tier: "CORE",
  });

  // ── Filtered users ────────────────────────────────────────────────────────
  const allUsers = useMemo(() => {
    const users = registeredUsers || [];
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q),
    );
  }, [registeredUsers, search]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const users = registeredUsers || [];
    const totalBalance = users.reduce((s, u) => s + (u.balance ?? 0), 0);
    const frozenCount = users.filter((u) => u.isFrozen).length;
    const blockedCount = users.filter((u) => u.isBlocked).length;
    const tradingCount = users.filter((u) => u.tradingEnabled !== false).length;
    return {
      total: users.length,
      totalBalance,
      frozenCount,
      blockedCount,
      tradingCount,
    };
  }, [registeredUsers]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type });
    },
    [],
  );

  const audit = useCallback(
    (action: string, target: string, level: AuditEntry["level"] = "action") => {
      addAuditEntry({
        id: uid(),
        time: new Date().toISOString(),
        actor: currentUser?.email || "admin",
        action,
        target,
        level,
      });
    },
    [addAuditEntry, currentUser],
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleToggleFreeze = (u: User) => {
    const frozen = !u.isFrozen;
    updateUserById(u.id, { isFrozen: frozen });
    audit(
      frozen ? "Froze account" : "Unfroze account",
      u.email,
      frozen ? "warning" : "success",
    );
    showToast(`${u.firstName} ${frozen ? "frozen" : "unfrozen"}`);
  };

  const handleToggleBlock = (u: User) => {
    const blocked = !u.isBlocked;
    updateUserById(u.id, { isBlocked: blocked });
    audit(
      blocked ? "Blocked account" : "Unblocked account",
      u.email,
      blocked ? "danger" : "success",
    );
    showToast(`${u.firstName} ${blocked ? "blocked" : "unblocked"}`);
  };

  const handleToggleTrading = (u: User) => {
    const enabled = u.tradingEnabled === false;
    updateUserById(u.id, { tradingEnabled: enabled });
    audit(enabled ? "Enabled trading" : "Disabled trading", u.email, "action");
    showToast(`Trading ${enabled ? "started" : "stopped"} for ${u.firstName}`);
  };

  const handleFundDebit = () => {
    if (!fundModal) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    const user = registeredUsers.find((u) => u.id === fundModal.userId);
    if (!user) return;

    const isFund = fundModal.mode === "fund";
    const newBalance = (user.balance ?? 0) + (isFund ? amount : -amount);

    const txn: Transaction = {
      id: uid(),
      type: isFund ? "CREDIT" : "DEBIT",
      amount: isFund ? amount : -amount,
      note: fundNote || (isFund ? "Admin credit" : "Admin debit"),
      timestamp: new Date().toISOString(),
      performedBy: currentUser?.email || "admin",
    };

    updateUserById(fundModal.userId, {
      balance: Math.max(0, newBalance),
      transactions: [...(user.transactions || []), txn],
    });

    audit(
      `${isFund ? "Funded" : "Debited"} ${formatCurrency(amount)}`,
      user.email,
      isFund ? "success" : "warning",
    );
    showToast(
      `${isFund ? "Funded" : "Debited"} ${formatCurrency(amount)} ${isFund ? "to" : "from"} ${user.firstName}`,
    );
    setFundModal(null);
    setFundAmount("");
    setFundNote("");
  };

  const handleEditSave = () => {
    if (!editModal) return;
    updateUserById(editModal.id, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      phone: editForm.phone || undefined,
      tier: editForm.tier as User["tier"],
      country: editForm.country || undefined,
    });
    audit("Edited profile", editModal.email, "action");
    showToast(`Updated ${editForm.firstName}'s profile`);
    setEditModal(null);
  };

  const handleProfitSave = () => {
    if (!profitModal) return;
    updateUserById(profitModal.id, {
      profitRate: profitForm.profitRate,
      profitMode: profitForm.profitMode as User["profitMode"],
      profitSchedule: profitForm.profitSchedule as User["profitSchedule"],
      profitMultiplier: profitForm.profitMultiplier,
    });
    audit(
      `Set profit: ${profitForm.profitRate}%/${profitForm.profitSchedule} (${profitForm.profitMode})`,
      profitModal.email,
      "action",
    );
    showToast(`Profit config updated for ${profitModal.firstName}`);
    setProfitModal(null);
  };

  const handleBackdateSave = () => {
    if (!backdateModal || !backdateValue) return;
    updateUserById(backdateModal.id, {
      createdAt: new Date(backdateValue).toISOString(),
    });
    audit(
      `Backdated account to ${backdateValue}`,
      backdateModal.email,
      "warning",
    );
    showToast(`Account date updated for ${backdateModal.firstName}`);
    setBackdateModal(null);
    setBackdateValue("");
  };

  const handleDeleteUser = (u: User) => {
    if (!confirm(`Permanently delete ${u.firstName} ${u.lastName}?`)) return;
    deleteUserById(u.id);
    audit("Deleted account", u.email, "danger");
    showToast(`Deleted ${u.firstName}`, "error");
  };

  const handleCreateUser = async () => {
    if (
      !createForm.firstName ||
      !createForm.lastName ||
      !createForm.email ||
      !createForm.password
    ) {
      showToast("Fill all required fields", "error");
      return;
    }
    const result = await createUserAsAdmin({
      firstName: createForm.firstName,
      lastName: createForm.lastName,
      email: createForm.email,
      password: createForm.password,
      role: createForm.role,
      tier: createForm.tier,
    });
    if (result.success) {
      audit("Created user", createForm.email, "success");
      showToast(`User ${createForm.firstName} created`);
      setCreateForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "USER",
        tier: "CORE",
      });
      setActiveTab("users");
    } else {
      showToast(result.error || "Failed to create user", "error");
    }
  };

  // ── If not admin, show login gate ─────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="bg-[#0f0f14] border border-white/10 rounded-2xl p-10 text-center max-w-md">
          <Shield size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 text-sm mb-6">
            You must be logged in as a God Admin to access this panel.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#08080c]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                X-CAPITAL{" "}
                <span className="text-purple-400 text-sm font-normal ml-1">
                  GOD ADMIN
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">{currentUser?.email}</span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-gray-400 hover:text-white transition p-2"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Stats Row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value={stats.total}
            icon={Users}
            accent="bg-purple-600/20 text-purple-400"
          />
          <StatCard
            label="Total Balance"
            value={formatCurrency(stats.totalBalance, true)}
            icon={DollarSign}
            accent="bg-green-600/20 text-green-400"
          />
          <StatCard
            label="Frozen"
            value={stats.frozenCount}
            icon={Snowflake}
            accent="bg-cyan-600/20 text-cyan-400"
          />
          <StatCard
            label="Blocked"
            value={stats.blockedCount}
            icon={Ban}
            accent="bg-red-600/20 text-red-400"
          />
          <StatCard
            label="Trading"
            value={stats.tradingCount}
            icon={Activity}
            accent="bg-amber-600/20 text-amber-400"
          />
        </div>

        {/* ── Tab Nav ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-6 bg-[#12121a] rounded-lg p-1 w-fit">
          {(
            [
              { key: "users", label: "Users", icon: Users },
              { key: "audit", label: "Audit Log", icon: Clock },
              { key: "create", label: "Create User", icon: UserPlus },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition",
                activeTab === t.key
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              )}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* USERS TAB                                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div>
            {/* Search */}
            <div className="relative mb-5">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or ID…"
                className="w-full md:w-96 pl-10 pr-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* User List */}
            {allUsers.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isExpanded={expandedUser === u.id}
                    onToggleExpand={() =>
                      setExpandedUser(expandedUser === u.id ? null : u.id)
                    }
                    onFreeze={() => handleToggleFreeze(u)}
                    onBlock={() => handleToggleBlock(u)}
                    onTrade={() => handleToggleTrading(u)}
                    onFund={() => setFundModal({ userId: u.id, mode: "fund" })}
                    onDebit={() =>
                      setFundModal({ userId: u.id, mode: "debit" })
                    }
                    onEdit={() => {
                      setEditForm({
                        firstName: u.firstName,
                        lastName: u.lastName,
                        email: u.email,
                        phone: u.phone || "",
                        tier: u.tier,
                        country: u.country || "",
                      });
                      setEditModal(u);
                    }}
                    onProfit={() => {
                      setProfitForm({
                        profitRate: u.profitRate ?? 1.5,
                        profitMode: u.profitMode ?? "linear",
                        profitSchedule: u.profitSchedule ?? "daily",
                        profitMultiplier: u.profitMultiplier ?? 1,
                      });
                      setProfitModal(u);
                    }}
                    onBackdate={() => {
                      setBackdateValue(
                        u.createdAt
                          ? new Date(u.createdAt).toISOString().slice(0, 10)
                          : "",
                      );
                      setBackdateModal(u);
                    }}
                    onDelete={() => handleDeleteUser(u)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* AUDIT LOG TAB                                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "audit" && (
          <div className="bg-[#12121a] border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Recent Activity
              </h3>
              <span className="text-xs text-gray-500">
                {auditLog.length} entries
              </span>
            </div>
            {auditLog.length === 0 ? (
              <p className="text-center py-12 text-gray-600 text-sm">
                No audit entries yet
              </p>
            ) : (
              <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                {auditLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="px-5 py-3 flex items-center gap-4 text-sm"
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        entry.level === "success" && "bg-green-500",
                        entry.level === "warning" && "bg-yellow-500",
                        entry.level === "danger" && "bg-red-500",
                        entry.level === "action" && "bg-purple-500",
                        entry.level === "info" && "bg-blue-500",
                      )}
                    />
                    <span className="text-gray-500 text-xs w-36 flex-shrink-0">
                      {new Date(entry.time).toLocaleString()}
                    </span>
                    <span className="text-white font-medium flex-1">
                      {entry.action}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {entry.target}
                    </span>
                    <span className="text-gray-600 text-xs">{entry.actor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CREATE USER TAB                                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "create" && (
          <div className="max-w-lg">
            <div className="bg-[#12121a] border border-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white mb-2">
                Create New User
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="First Name"
                  value={createForm.firstName}
                  onChange={(v) =>
                    setCreateForm({ ...createForm, firstName: v })
                  }
                />
                <Field
                  label="Last Name"
                  value={createForm.lastName}
                  onChange={(v) =>
                    setCreateForm({ ...createForm, lastName: v })
                  }
                />
              </div>
              <Field
                label="Email"
                value={createForm.email}
                type="email"
                onChange={(v) => setCreateForm({ ...createForm, email: v })}
              />
              <Field
                label="Password"
                value={createForm.password}
                type="password"
                onChange={(v) => setCreateForm({ ...createForm, password: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Role"
                  value={createForm.role}
                  options={["USER", "ADMIN"]}
                  onChange={(v) => setCreateForm({ ...createForm, role: v })}
                />
                <SelectField
                  label="Tier"
                  value={createForm.tier}
                  options={["CORE", "GOLD", "BLACK"]}
                  onChange={(v) => setCreateForm({ ...createForm, tier: v })}
                />
              </div>
              <button
                onClick={handleCreateUser}
                className="w-full mt-2 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition"
              >
                Create User
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Fund / Debit Modal */}
      {fundModal && (
        <Modal
          title={fundModal.mode === "fund" ? "Fund Account" : "Debit Account"}
          onClose={() => {
            setFundModal(null);
            setFundAmount("");
            setFundNote("");
          }}
        >
          <div className="space-y-4">
            <Field
              label="Amount (USD)"
              value={fundAmount}
              type="number"
              onChange={setFundAmount}
              placeholder="0.00"
            />
            <Field
              label="Note"
              value={fundNote}
              onChange={setFundNote}
              placeholder={
                fundModal.mode === "fund"
                  ? "e.g. Wire deposit"
                  : "e.g. Withdrawal"
              }
            />
            <button
              onClick={handleFundDebit}
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-medium transition",
                fundModal.mode === "fund"
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-red-600 hover:bg-red-500",
              )}
            >
              {fundModal.mode === "fund" ? "Credit Funds" : "Debit Funds"}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {editModal && (
        <Modal title="Edit User Profile" onClose={() => setEditModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="First Name"
                value={editForm.firstName}
                onChange={(v) => setEditForm({ ...editForm, firstName: v })}
              />
              <Field
                label="Last Name"
                value={editForm.lastName}
                onChange={(v) => setEditForm({ ...editForm, lastName: v })}
              />
            </div>
            <Field
              label="Email"
              value={editForm.email}
              onChange={(v) => setEditForm({ ...editForm, email: v })}
            />
            <Field
              label="Phone"
              value={editForm.phone}
              onChange={(v) => setEditForm({ ...editForm, phone: v })}
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Tier"
                value={editForm.tier}
                options={["CORE", "GOLD", "BLACK"]}
                onChange={(v) => setEditForm({ ...editForm, tier: v })}
              />
              <Field
                label="Country"
                value={editForm.country}
                onChange={(v) => setEditForm({ ...editForm, country: v })}
              />
            </div>
            <button
              onClick={handleEditSave}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Profit Config Modal */}
      {profitModal && (
        <Modal
          title={`Profit Config — ${profitModal.firstName}`}
          onClose={() => setProfitModal(null)}
        >
          <div className="space-y-4">
            <Field
              label="Daily Profit Rate (%)"
              value={String(profitForm.profitRate)}
              type="number"
              onChange={(v) =>
                setProfitForm({ ...profitForm, profitRate: parseFloat(v) || 0 })
              }
              placeholder="1.5"
            />
            <SelectField
              label="Profit Mode"
              value={profitForm.profitMode}
              options={["linear", "compound", "stepped", "random"]}
              onChange={(v) => setProfitForm({ ...profitForm, profitMode: v })}
            />
            <SelectField
              label="Schedule"
              value={profitForm.profitSchedule}
              options={["daily", "weekly", "monthly"]}
              onChange={(v) =>
                setProfitForm({ ...profitForm, profitSchedule: v })
              }
            />
            <Field
              label="Multiplier"
              value={String(profitForm.profitMultiplier)}
              type="number"
              onChange={(v) =>
                setProfitForm({
                  ...profitForm,
                  profitMultiplier: parseFloat(v) || 1,
                })
              }
              placeholder="1.0"
            />
            <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3 text-xs text-gray-400">
              <p className="font-medium text-purple-400 mb-1">How it works</p>
              <p>
                <strong>Linear</strong> — flat % added daily.{" "}
                <strong>Compound</strong> — interest on interest.{" "}
                <strong>Stepped</strong> — increases at milestones.{" "}
                <strong>Random</strong> — realistic variance.
              </p>
              <p className="mt-1">
                Multiplier scales the base rate (e.g. 2× doubles profits).
              </p>
            </div>
            <button
              onClick={handleProfitSave}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition"
            >
              Apply Profit Config
            </button>
          </div>
        </Modal>
      )}

      {/* Backdate Modal */}
      {backdateModal && (
        <Modal
          title={`Backdate — ${backdateModal.firstName}`}
          onClose={() => {
            setBackdateModal(null);
            setBackdateValue("");
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Change when this account appears to have been created.
            </p>
            <Field
              label="Account Creation Date"
              value={backdateValue}
              type="date"
              onChange={setBackdateValue}
            />
            <button
              onClick={handleBackdateSave}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition"
            >
              Update Creation Date
            </button>
          </div>
        </Modal>
      )}

      {/* inline animation */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── User Row ────────────────────────────────────────────────────────────────
function UserRow({
  user,
  isExpanded,
  onToggleExpand,
  onFreeze,
  onBlock,
  onTrade,
  onFund,
  onDebit,
  onEdit,
  onProfit,
  onBackdate,
  onDelete,
}: {
  user: User;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFreeze: () => void;
  onBlock: () => void;
  onTrade: () => void;
  onFund: () => void;
  onDebit: () => void;
  onEdit: () => void;
  onProfit: () => void;
  onBackdate: () => void;
  onDelete: () => void;
}) {
  const tierColor =
    user.tier === "BLACK"
      ? "text-white bg-white/10"
      : user.tier === "GOLD"
        ? "text-amber-400 bg-amber-500/10"
        : "text-purple-400 bg-purple-500/10";

  return (
    <div className="bg-[#12121a] border border-white/5 rounded-xl overflow-hidden">
      {/* Summary row */}
      <div
        className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition"
        onClick={onToggleExpand}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </div>

        {/* Name & email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user.firstName} {user.lastName}
            {user.role === "ADMIN" && (
              <span className="ml-2 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">
                ADMIN
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>

        {/* Status badges */}
        <div className="hidden md:flex items-center gap-2">
          {user.isFrozen && (
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Snowflake size={10} /> Frozen
            </span>
          )}
          {user.isBlocked && (
            <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Ban size={10} /> Blocked
            </span>
          )}
          {user.tradingEnabled === false && (
            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Pause size={10} /> No Trade
            </span>
          )}
        </div>

        {/* Tier */}
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded font-medium",
            tierColor,
          )}
        >
          {user.tier}
        </span>

        {/* Balance */}
        <span className="text-sm font-semibold text-green-400 w-28 text-right">
          {formatCurrency(user.balance ?? 0)}
        </span>

        {/* Expand chevron */}
        {isExpanded ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/5">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs">
            <InfoCell label="ID" value={user.id} />
            <InfoCell label="Phone" value={user.phone || "—"} />
            <InfoCell label="Country" value={user.country || "—"} />
            <InfoCell
              label="Joined"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"
              }
            />
            <InfoCell label="KYC" value={user.kycStatus} />
            <InfoCell
              label="Profit Rate"
              value={
                user.profitRate != null ? `${user.profitRate}%` : "Default"
              }
            />
            <InfoCell label="Profit Mode" value={user.profitMode || "linear"} />
            <InfoCell
              label="Last Login"
              value={
                user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "—"
              }
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <ActionBtn
              icon={DollarSign}
              label="Fund"
              color="bg-green-600/20 text-green-400 hover:bg-green-600/30"
              onClick={onFund}
            />
            <ActionBtn
              icon={TrendingUp}
              label="Debit"
              color="bg-red-600/20 text-red-400 hover:bg-red-600/30"
              onClick={onDebit}
            />
            <ActionBtn
              icon={Edit3}
              label="Edit"
              color="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
              onClick={onEdit}
            />
            <ActionBtn
              icon={Percent}
              label="Profit"
              color="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
              onClick={onProfit}
            />
            <ActionBtn
              icon={Calendar}
              label="Backdate"
              color="bg-amber-600/20 text-amber-400 hover:bg-amber-600/30"
              onClick={onBackdate}
            />
            <div className="border-l border-white/10 mx-1" />
            <ActionBtn
              icon={user.isFrozen ? Unlock : Snowflake}
              label={user.isFrozen ? "Unfreeze" : "Freeze"}
              color={
                user.isFrozen
                  ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                  : "bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30"
              }
              onClick={onFreeze}
            />
            <ActionBtn
              icon={user.isBlocked ? CheckCircle : Ban}
              label={user.isBlocked ? "Unblock" : "Block"}
              color={
                user.isBlocked
                  ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                  : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
              }
              onClick={onBlock}
            />
            <ActionBtn
              icon={user.tradingEnabled === false ? Play : Pause}
              label={
                user.tradingEnabled === false ? "Start Trade" : "Stop Trade"
              }
              color={
                user.tradingEnabled === false
                  ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                  : "bg-orange-600/20 text-orange-400 hover:bg-orange-600/30"
              }
              onClick={onTrade}
            />
            <div className="border-l border-white/10 mx-1" />
            <ActionBtn
              icon={Trash2}
              label="Delete"
              color="bg-red-600/20 text-red-500 hover:bg-red-600/40"
              onClick={onDelete}
            />
          </div>

          {/* Transaction History (last 10) */}
          {user.transactions && user.transactions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                Transaction History
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {user.transactions
                  .slice(-10)
                  .reverse()
                  .map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center gap-3 text-xs px-3 py-1.5 bg-white/[0.02] rounded"
                    >
                      <span
                        className={cn(
                          "font-medium w-14",
                          txn.type === "CREDIT" || txn.type === "PROFIT"
                            ? "text-green-400"
                            : "text-red-400",
                        )}
                      >
                        {txn.type}
                      </span>
                      <span
                        className={cn(
                          "w-24 text-right",
                          txn.amount >= 0 ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {txn.amount >= 0 ? "+" : ""}
                        {formatCurrency(txn.amount)}
                      </span>
                      <span className="text-gray-500 flex-1 truncate">
                        {txn.note}
                      </span>
                      <span className="text-gray-600">
                        {new Date(txn.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reusable micro-components ───────────────────────────────────────────────

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-600 uppercase tracking-wider text-[10px]">
        {label}
      </p>
      <p className="text-gray-300 mt-0.5 truncate">{value}</p>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition",
        color,
      )}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#1a1a24] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[#1a1a24] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
