"use client";

import { cn } from "@/lib/utils";
import {
  Wifi,
  Globe,
  Activity,
  Zap,
  Satellite,
  Radio,
} from "lucide-react";

const STATS = [
  {
    label: "Active Sats",
    value: "7,200+",
    sub: "LEO Constellation",
    icon: Satellite,
    trend: "+340/mo",
  },
  {
    label: "Countries",
    value: "105+",
    sub: "Global Coverage",
    icon: Globe,
    trend: "Expanding",
  },
  {
    label: "Throughput",
    value: "847 TB",
    sub: "Daily Bandwidth",
    icon: Activity,
    trend: "+12% QoQ",
  },
  {
    label: "Node Yield",
    value: "$2.4K+",
    sub: "Monthly / Node",
    icon: Zap,
    trend: "$1M/mo Pool",
  },
];

const LIVE_METRICS = [
  { label: "Uptime", value: "99.97%", icon: Radio },
  { label: "Latency", value: "<25ms", icon: Wifi },
  { label: "Relays", value: "14,892", icon: Satellite },
  { label: "Coverage", value: "Polar", icon: Globe },
];

interface StarlinkStatsProps {
  className?: string;
  compact?: boolean;
  showLiveMetrics?: boolean;
}

export default function StarlinkStats({
  className,
  compact,
  showLiveMetrics = false,
}: StarlinkStatsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map(({ label, value, sub, icon: Icon, trend }) => (
          <div
            key={label}
            className={cn(
              "starlink-card rounded-xl p-3 transition-all duration-300 hover:border-emerald-500/30 group",
              compact && "p-2.5",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Icon
                  className={cn(
                    "text-emerald-400 transition-transform group-hover:scale-110",
                    compact ? "w-3 h-3" : "w-3.5 h-3.5",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold text-xc-muted uppercase tracking-wider",
                    compact && "text-[9px]",
                  )}
                >
                  {label}
                </span>
              </div>
              <span className="text-[9px] font-mono text-emerald-500/70 bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                {trend}
              </span>
            </div>
            <div
              className={cn(
                "font-black text-white font-mono profit-number",
                compact ? "text-sm" : "text-base",
              )}
            >
              {value}
            </div>
            <div
              className={cn(
                "text-[10px] text-xc-muted/60 mt-0.5",
                compact && "text-[9px]",
              )}
            >
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Live Metrics Strip */}
      {showLiveMetrics && (
        <div className="grid grid-cols-4 gap-2">
          {LIVE_METRICS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-center hover:border-emerald-500/20 transition-all"
            >
              <Icon className="w-3 h-3 text-emerald-500/50 mx-auto mb-1" />
              <div className="text-xs font-black text-white font-mono">
                {value}
              </div>
              <div className="text-[9px] text-xc-muted/50">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Signal Strength Indicator */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="signal-bars">
            <div className="signal-bar" />
            <div className="signal-bar" />
            <div className="signal-bar" />
            <div className="signal-bar" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
            XLINK Active
          </span>
        </div>
        <span className="text-[10px] font-mono text-xc-muted/50">
          SAT-A7 · ORBIT 342
        </span>
      </div>
    </div>
  );
}
