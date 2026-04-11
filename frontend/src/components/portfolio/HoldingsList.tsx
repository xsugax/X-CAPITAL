"use client";

import {
  cn,
  formatCurrency,
  formatPercent,
  getChangeColor,
  getAssetTypeColor,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { PortfolioHolding } from "@/types";

interface HoldingsListProps {
  holdings: PortfolioHolding[];
  loading?: boolean;
}

export default function HoldingsList({
  holdings,
  loading = false,
}: HoldingsListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!holdings.length) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3 opacity-30">📊</div>
        <p className="text-xc-muted text-sm">
          No holdings yet. Start trading to build your portfolio.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div className="grid grid-cols-[1fr_repeat(4,_auto)] gap-2 md:gap-4 px-3 mb-2">
        <span className="text-xs text-xc-muted font-medium">Asset</span>
        <span className="text-xs text-xc-muted font-medium text-right">
          Qty
        </span>
        <span className="text-xs text-xc-muted font-medium text-right hidden sm:block">
          Avg Cost
        </span>
        <span className="text-xs text-xc-muted font-medium text-right">
          Value
        </span>
        <span className="text-xs text-xc-muted font-medium text-right">
          P&amp;L
        </span>
      </div>

      <div className="space-y-1">
        {holdings.map((holding) => {
          const pnl = Number(holding.unrealizedPnL ?? 0);
          const pnlPct =
            Number(holding.avgCost) > 0
              ? (pnl / (Number(holding.quantity) * Number(holding.avgCost))) *
                100
              : 0;
          const assetColor = getAssetTypeColor(holding.asset?.type ?? "STOCK");

          return (
            <div
              key={holding.id}
              className="grid grid-cols-[1fr_repeat(4,_auto)] gap-2 md:gap-4 items-center px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-transparent hover:border-xc-border/50 transition-all"
            >
              {/* Asset info */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${assetColor}33, ${assetColor}11)`,
                    border: `1px solid ${assetColor}44`,
                  }}
                >
                  {holding.asset?.symbol?.[0] ?? "?"}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white">
                    {holding.asset?.symbol}
                  </div>
                  <div className="text-xs text-xc-muted truncate max-w-[80px] md:max-w-none">
                    {holding.asset?.name}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <span className="text-sm font-black font-mono tabular-nums text-white text-right">
                {Number(holding.quantity ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </span>

              {/* Avg cost */}
              <span className="text-sm font-bold font-mono tabular-nums text-white/60 text-right hidden sm:block">
                {formatCurrency(Number(holding.avgCost ?? 0))}
              </span>

              {/* Current value */}
              <span className="text-sm font-black font-mono tabular-nums text-white text-right">
                {formatCurrency(Number(holding.currentValue))}
              </span>

              {/* P&L */}
              <div
                className={cn("flex flex-col items-end", getChangeColor(pnl))}
              >
                <span className="flex items-center gap-0.5 text-sm font-black tabular-nums">
                  {pnl >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {formatCurrency(Math.abs(pnl))}
                </span>
                <span className="text-xs font-black tabular-nums opacity-80">
                  {formatPercent(pnlPct)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
