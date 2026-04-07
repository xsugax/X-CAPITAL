"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  tag?: string;
}

const TICKER_DATA: TickerItem[] = [
  { symbol: "TSLA", price: 342.18, change: 3.12, tag: "NYSE" },
  { symbol: "SpaceX", price: 252.00, change: 6.84, tag: "PRIVATE" },
  { symbol: "NVDA", price: 875.39, change: 2.41 },
  { symbol: "BTC", price: 97842.50, change: -1.23, tag: "CRYPTO" },
  { symbol: "DOGE", price: 0.4217, change: 8.52, tag: "CRYPTO" },
  { symbol: "xAI", price: 180.00, change: 12.4, tag: "PRIVATE" },
  { symbol: "AAPL", price: 213.07, change: 0.84 },
  { symbol: "AMZN", price: 196.25, change: -0.62 },
  { symbol: "META", price: 513.92, change: 1.37 },
  { symbol: "PLTR", price: 23.47, change: 4.21 },
  { symbol: "ETH", price: 3842.10, change: -0.38, tag: "CRYPTO" },
  { symbol: "SOL", price: 187.63, change: 5.17, tag: "CRYPTO" },
  { symbol: "MSFT", price: 428.50, change: 0.97 },
  { symbol: "GOOGL", price: 178.32, change: -0.14 },
  { symbol: "Starlink", price: 95.00, change: 4.22, tag: "PRIVATE" },
  { symbol: "Neuralink", price: 48.50, change: 9.8, tag: "PRIVATE" },
  { symbol: "Boring Co", price: 32.00, change: 2.15, tag: "PRIVATE" },
];

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
}

export default function MarketTicker() {
  const [data, setData] = useState(TICKER_DATA);

  // Simulate micro price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((item) => ({
          ...item,
          price: item.price * (1 + (Math.random() - 0.5) * 0.002),
          change: item.change + (Math.random() - 0.5) * 0.15,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const items = [...data, ...data]; // duplicate for seamless loop

  return (
    <div className="w-full bg-xc-black/90 border-b border-white/[0.04] overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-xc-black/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-xc-black/90 to-transparent z-10 pointer-events-none" />

      <div className="flex items-center animate-ticker whitespace-nowrap py-1.5">
        {items.map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="inline-flex items-center gap-2 px-4 border-r border-white/[0.04] shrink-0"
          >
            <span className="text-[11px] font-bold text-white/90">{item.symbol}</span>
            {item.tag && (
              <span className={cn(
                "text-[8px] font-mono px-1 py-px rounded",
                item.tag === "PRIVATE"
                  ? "bg-purple-900/50 text-purple-400"
                  : item.tag === "CRYPTO"
                    ? "bg-amber-900/50 text-amber-400"
                    : "bg-white/10 text-white/50"
              )}>
                {item.tag}
              </span>
            )}
            <span className="text-[11px] font-mono text-white/70">${formatPrice(item.price)}</span>
            <span className={cn(
              "text-[10px] font-bold flex items-center gap-0.5",
              item.change >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {item.change >= 0 ? (
                <TrendingUp className="w-2.5 h-2.5" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5" />
              )}
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
