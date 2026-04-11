"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Cpu,
  ShoppingBag,
  CheckCheck,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotifType =
  | "trade"
  | "deposit"
  | "security"
  | "ai"
  | "commerce"
  | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  href?: string;
}

const NOTIF_STYLES: Record<
  NotifType,
  { icon: React.ReactNode; color: string }
> = {
  trade: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: "bg-emerald-500/20 text-emerald-400",
  },
  deposit: {
    icon: <Wallet className="w-4 h-4" />,
    color: "bg-blue-500/20 text-blue-400",
  },
  security: {
    icon: <ShieldCheck className="w-4 h-4" />,
    color: "bg-amber-500/20 text-white/50",
  },
  ai: {
    icon: <Cpu className="w-4 h-4" />,
    color: "bg-white/[0.06] text-white/60",
  },
  commerce: {
    icon: <ShoppingBag className="w-4 h-4" />,
    color: "bg-red-500/20 text-red-400",
  },
  system: {
    icon: <Info className="w-4 h-4" />,
    color: "bg-white/10 text-white/70",
  },
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "trade",
    title: "Trade Executed",
    message: "Bought 5 shares of TSLA at $248.50",
    time: "2 min ago",
    read: false,
    href: "/portfolio",
  },
  {
    id: "2",
    type: "ai",
    title: "AI Oracle Signal",
    message: "Strong BUY signal detected for NVDA — 94% confidence",
    time: "15 min ago",
    read: false,
    href: "/oracle",
  },
  {
    id: "3",
    type: "deposit",
    title: "Deposit Confirmed",
    message: "$10,000.00 has been credited to your wallet",
    time: "1 hr ago",
    read: false,
    href: "/wallet",
  },
  {
    id: "4",
    type: "commerce",
    title: "Order Shipped",
    message: "Tesla Model Y AWD — tracking available",
    time: "3 hrs ago",
    read: true,
    href: "/commerce",
  },
  {
    id: "5",
    type: "security",
    title: "New Login Detected",
    message: "Login from Chrome on Windows — New York, US",
    time: "5 hrs ago",
    read: true,
    href: "/settings",
  },
  {
    id: "6",
    type: "system",
    title: "Platform Update",
    message: "X-CAPITAL v2.1 — New commerce rail features",
    time: "1 day ago",
    read: true,
  },
  {
    id: "7",
    type: "trade",
    title: "Dividend Received",
    message: "AAPL quarterly dividend — $4.25 credited",
    time: "2 days ago",
    read: true,
    href: "/wallet",
  },
  {
    id: "8",
    type: "ai",
    title: "Portfolio Alert",
    message: "Your portfolio is up 3.2% this week",
    time: "3 days ago",
    read: true,
    href: "/portfolio",
  },
];

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function NotificationsPanel({
  open,
  onClose,
  anchorRef,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (notif: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
    );
    if (notif.href) {
      onClose();
      router.push(notif.href);
    }
  };

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-xc-card border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-xc-purple/20 text-white/70 px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-xc-muted hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-xc-muted">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No notifications
          </div>
        ) : (
          notifications.map((notif) => {
            const style = NOTIF_STYLES[notif.type];
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-white/[0.03] last:border-0",
                  notif.read
                    ? "hover:bg-white/[0.02]"
                    : "bg-white/[0.02] hover:bg-white/[0.04]",
                  notif.href && "cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                    style.color,
                  )}
                >
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium truncate",
                        notif.read ? "text-white/70" : "text-white",
                      )}
                    >
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-xc-purple flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-xc-muted mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-xc-muted/50 mt-1 block">
                    {notif.time}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                  {notif.href && (
                    <ArrowUpRight className="w-3.5 h-3.5 text-xc-muted/40" />
                  )}
                  <button
                    onClick={(e) => dismiss(notif.id, e)}
                    className="w-5 h-5 rounded flex items-center justify-center text-xc-muted/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function useUnreadCount() {
  // This returns the initial unread count for the badge in Header
  return INITIAL_NOTIFICATIONS.filter((n) => !n.read).length;
}
