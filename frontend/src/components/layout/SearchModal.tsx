"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  Home,
  BarChart3,
  Briefcase,
  Globe,
  ShoppingBag,
  Cpu,
  Wallet,
  Settings,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  category: "page" | "asset" | "product" | "action";
  icon: React.ReactNode;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Pages
  {
    id: "p-home",
    label: "Home",
    description: "Dashboard overview",
    href: "/dashboard",
    category: "page",
    icon: <Home className="w-4 h-4" />,
  },
  {
    id: "p-trading",
    label: "Trading",
    description: "Buy & sell assets",
    href: "/trading",
    category: "page",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    id: "p-portfolio",
    label: "Portfolio",
    description: "Holdings & performance",
    href: "/portfolio",
    category: "page",
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    id: "p-funds",
    label: "Funds & SPVs",
    description: "Private equity & venture",
    href: "/funds",
    category: "page",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: "p-commerce",
    label: "Commerce",
    description: "Products & investments",
    href: "/commerce",
    category: "page",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    id: "p-oracle",
    label: "AI Oracle",
    description: "AI forecasts & signals",
    href: "/oracle",
    category: "page",
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    id: "p-wallet",
    label: "Wallet",
    description: "Deposits & withdrawals",
    href: "/wallet",
    category: "page",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    id: "p-settings",
    label: "Settings",
    description: "Account & preferences",
    href: "/settings",
    category: "page",
    icon: <Settings className="w-4 h-4" />,
  },

  // Assets
  {
    id: "a-tsla",
    label: "TSLA",
    description: "Tesla, Inc.",
    href: "/trading",
    category: "asset",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "a-nvda",
    label: "NVDA",
    description: "NVIDIA Corporation",
    href: "/trading",
    category: "asset",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "a-aapl",
    label: "AAPL",
    description: "Apple Inc.",
    href: "/trading",
    category: "asset",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "a-meta",
    label: "META",
    description: "Meta Platforms",
    href: "/trading",
    category: "asset",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "a-amzn",
    label: "AMZN",
    description: "Amazon.com Inc.",
    href: "/trading",
    category: "asset",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "a-msft",
    label: "MSFT",
    description: "Microsoft Corporation",
    href: "/trading",
    category: "asset",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "a-pltr",
    label: "PLTR",
    description: "Palantir Technologies",
    href: "/trading",
    category: "asset",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "a-xspace",
    label: "XSPACE",
    description: "X-SPACE SPV Fund",
    href: "/trading",
    category: "asset",
    icon: <TrendingUp className="w-4 h-4" />,
  },

  // Products
  {
    id: "pr-my",
    label: "Tesla Model Y",
    description: "AWD — $47,990",
    href: "/commerce",
    category: "product",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    id: "pr-ct",
    label: "Tesla Cybertruck",
    description: "Foundation — $99,990",
    href: "/commerce",
    category: "product",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    id: "pr-pw",
    label: "Tesla Powerwall 3",
    description: "Home battery — $11,500",
    href: "/commerce",
    category: "product",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    id: "pr-sl",
    label: "Starlink Residential",
    description: "Satellite internet — $499",
    href: "/commerce",
    category: "product",
    icon: <ShoppingBag className="w-4 h-4" />,
  },

  // Actions
  {
    id: "act-deposit",
    label: "Deposit Funds",
    description: "Add money to wallet",
    href: "/wallet",
    category: "action",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    id: "act-withdraw",
    label: "Withdraw Funds",
    description: "Cash out to bank",
    href: "/wallet",
    category: "action",
    icon: <Wallet className="w-4 h-4" />,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  page: "Pages",
  asset: "Assets",
  product: "Products",
  action: "Actions",
};

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        );
      })
    : SEARCH_ITEMS.filter((item) => item.category === "page");

  const grouped = filtered.reduce<Record<string, SearchItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const flatList = Object.values(grouped).flat();

  const navigate = useCallback(
    (item: SearchItem) => {
      onClose();
      setQuery("");
      router.push(item.href);
    },
    [onClose, router],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flatList[activeIndex]) {
        e.preventDefault();
        navigate(flatList[activeIndex]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, activeIndex, flatList, navigate]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Ctrl/Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // parent toggles
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  let itemCounter = 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl mx-4 bg-xc-card border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search className="w-5 h-5 text-xc-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, assets, products..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-xc-muted/60 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-xc-muted/50 font-mono bg-white/5 border border-white/[0.06] rounded px-1.5 py-0.5">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="sm:hidden text-xc-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {flatList.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-xc-muted">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-xc-muted/60 uppercase tracking-widest">
                  {CATEGORY_LABELS[category] ?? category}
                </div>
                {items.map((item) => {
                  const idx = itemCounter++;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      data-active={isActive}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          isActive
                            ? "bg-xc-purple/20 text-white/70"
                            : "bg-white/[0.04] text-xc-muted",
                        )}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-xc-muted truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <ArrowRight className="w-4 h-4 text-xc-muted flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-xc-muted/50">
          <span className="flex items-center gap-1">
            <kbd className="font-mono bg-white/5 border border-white/[0.06] rounded px-1 py-0.5">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono bg-white/5 border border-white/[0.06] rounded px-1 py-0.5">
              ↵
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono bg-white/5 border border-white/[0.06] rounded px-1 py-0.5">
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
