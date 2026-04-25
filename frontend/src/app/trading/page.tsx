"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AssetList from "@/components/trading/AssetList";
import OrderForm from "@/components/trading/OrderForm";
import OrbitalConstellation from "@/components/starlink/OrbitalConstellation";
import StarlinkStats from "@/components/starlink/StarlinkStats";
import { StatCard } from "@/components/ui/Card";
import type { Asset } from "@/types";
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Satellite,
  Radio,
  Zap,
  Globe,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const MARKET_STATS = [
  { label: "Total Assets", value: "50,000+", icon: Globe },
  { label: "Live Markets", value: "14", icon: Radio },
  { label: "24h Volume", value: "$2.4B", icon: TrendingUp },
  { label: "Active Orders", value: "847", icon: Zap },
];

export default function TradingPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  return (
    <DashboardLayout
      title="Trading Terminal"
      subtitle="Markets · Execution · Real-time intelligence"
    >
      <div className="space-y-5">
        {/* ═══════════════════════════════════════════════════════════════
            STARLINK ORBITAL HERO — Markets Gateway (EXTRAORDINARY)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#080c0a] via-[#0a0a0a] to-[#080c0a] p-6 md:p-8 lg:p-10">
          {/* Animated scan line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent animate-[starlinkScan_3s_linear_infinite]" />
          
          {/* Background constellation mesh with enhanced glow */}
          <div className="constellation-mesh absolute inset-0 opacity-40" />
          
          {/* Orbital glow effect */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text content */}
            <div className="flex-1 space-y-5 w-full">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="profit-signal">
                  Profit Signal Active
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Satellite-Linked Markets
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                  <span className="brand-xc">X-CAPITAL</span> Starlink
                  <br />
                  <span className="text-emerald-400/80">Constellation Network.</span>
                </h2>
                <p className="text-sm text-white/40 max-w-lg leading-relaxed">
                  Execute trades routed through the X-CAPITAL satellite mesh.
                  Every order benefits from sub-25ms latency and orbital-grade
                  redundancy. The market never sleeps — neither does the network.
                </p>
              </div>

              {/* Enhanced stats with live metrics */}
              <StarlinkStats className="max-w-lg pt-2" showLiveMetrics />

              {/* Quick action row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <div className="signal-bars">
                    <div className="signal-bar" />
                    <div className="signal-bar" />
                    <div className="signal-bar" />
                    <div className="signal-bar" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80">XLINK UPLINK</span>
                </div>
                <span className="text-[10px] font-mono text-white/30">
                  ROUTING THROUGH SAT-A7 · ORBIT 342
                </span>
              </div>
            </div>

            {/* Orbital visual with enhanced presentation */}
            <div className="shrink-0 flex items-center justify-center w-full lg:w-auto">
              <div className="relative">
                {/* Glow ring behind constellation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full border border-emerald-500/10 animate-pulse" />
                </div>
                <OrbitalConstellation size={280} dense className="opacity-95 relative z-10" />
                
                {/* Floating price tag with profit styling */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-950/90 border border-emerald-500/30 rounded-xl px-4 py-2 backdrop-blur-sm shadow-lg shadow-emerald-900/20 z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      XLINK Live
                    </div>
                  </div>
                  <div className="text-lg font-black text-white font-mono profit-number">
                    $95.25{" "}
                    <span className="text-emerald-400 text-sm">+4.22%</span>
                  </div>
                </div>

                {/* Orbital data points */}
                <div className="absolute -top-2 -right-4 md:right-0 bg-black/60 border border-white/10 rounded-lg px-2 py-1 backdrop-blur-sm">
                  <div className="data-stream">7,200+ SATs</div>
                </div>
                <div className="absolute top-1/2 -left-4 md:left-0 bg-black/60 border border-white/10 rounded-lg px-2 py-1 backdrop-blur-sm">
                  <div className="data-stream">{'<'}25ms</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            MARKET STATS STRIP
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {MARKET_STATS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-xc-card border border-xc-border rounded-xl p-3 md:p-4 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white/40" />
              </div>
              <div>
                <div className="text-xs text-xc-muted">{label}</div>
                <div className="text-sm font-black text-white font-mono">
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TRADING TERMINAL — Asset List + Order Form
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-[380px_1fr] gap-3 md:gap-4">
          {/* Markets panel */}
          <div className="bg-xc-card border border-xc-border rounded-2xl overflow-hidden flex flex-col h-[640px]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Markets</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Starlink Mesh Active
              </span>
            </div>
            <div className="flex-1 p-3 overflow-hidden">
              <AssetList
                onSelect={setSelectedAsset}
                selectedSymbol={selectedAsset?.symbol}
              />
            </div>
          </div>

          {/* Order execution panel */}
          <div className="bg-xc-card border border-xc-border rounded-2xl overflow-hidden flex flex-col h-[640px]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Order Execution</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-xc-muted uppercase tracking-wider">
                  Live
                </span>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              <OrderForm asset={selectedAsset} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
