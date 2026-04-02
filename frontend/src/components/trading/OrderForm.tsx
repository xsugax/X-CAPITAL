"use client";

import { useState, useEffect } from "react";
import { tradingAPI, walletAPI } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { Asset } from "@/types";
import { useStore } from "@/store/useStore";

type OrderSide = "buy" | "sell";

interface OrderFormProps {
  asset?: Asset | null;
}

export default function OrderForm({ asset }: OrderFormProps) {
  const { wallet } = useStore();
  const [side, setSide] = useState<OrderSide>("buy");
  const [amount, setAmount] = useState("");
  const [qty, setQty] = useState("");
  const [inputMode, setInputMode] = useState<"amount" | "qty">("amount");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Derived
  const price = Number(asset?.price ?? 0);
  const parsedAmount = parseFloat(amount) || 0;
  const parsedQty = parseFloat(qty) || 0;
  const estimatedQty =
    inputMode === "amount" ? (price > 0 ? parsedAmount / price : 0) : parsedQty;
  const estimatedCost = inputMode === "qty" ? parsedQty * price : parsedAmount;
  const availableCash = Number(wallet?.fiatBalance ?? 0);
  const hasSufficientFunds =
    side === "buy" ? estimatedCost <= availableCash : true;

  useEffect(() => {
    setAmount("");
    setQty("");
    setMessage(null);
  }, [asset?.symbol, side]);

  const handleQuickAmount = (pct: number) => {
    const val = (availableCash * pct).toFixed(2);
    setAmount(val);
    setInputMode("amount");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    setLoading(true);
    setMessage(null);
    try {
      if (side === "buy") {
        await tradingAPI.buy(asset.id, estimatedCost);
      } else {
        await tradingAPI.sell(asset.id, estimatedQty);
      }
      setMessage({
        type: "success",
        text: `${side === "buy" ? "Buy" : "Sell"} order placed for ${estimatedQty.toFixed(4)} ${asset.symbol}`,
      });
      setAmount("");
      setQty("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ?? "Order failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <TrendingUp className="w-7 h-7 text-xc-muted" />
        </div>
        <p className="text-xc-muted text-sm">
          Select an asset to start trading
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Asset header */}
      <div className="flex items-center gap-3 pb-4 border-b border-xc-border">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-cyan-900 flex items-center justify-center text-sm font-black text-white">
          {asset.symbol[0]}
        </div>
        <div>
          <div className="font-bold text-white">{asset.symbol}</div>
          <div className="text-xs text-xc-muted">{asset.name}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-mono font-bold text-white">
            {formatCurrency(price)}
          </div>
          <div
            className={cn(
              "text-xs font-semibold",
              Number(asset.priceChange24h) >= 0
                ? "text-xc-green"
                : "text-xc-red",
            )}
          >
            {Number(asset.priceChange24h) >= 0 ? "+" : ""}
            {Number(asset.priceChange24h).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Buy/Sell switch */}
      <div className="flex rounded-xl overflow-hidden border border-xc-border">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-1.5",
            side === "buy"
              ? "bg-xc-green/20 text-xc-green border-r border-xc-border"
              : "text-xc-muted hover:text-white",
          )}
        >
          <TrendingUp className="w-4 h-4" /> Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-1.5",
            side === "sell"
              ? "bg-xc-red/20 text-xc-red"
              : "text-xc-muted hover:text-white",
          )}
        >
          <TrendingDown className="w-4 h-4" /> Sell
        </button>
      </div>

      {/* Input mode toggle */}
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setInputMode("amount")}
          className={cn(
            "px-3 py-1 rounded-lg transition-all",
            inputMode === "amount"
              ? "bg-xc-purple/30 text-white"
              : "text-xc-muted hover:text-white",
          )}
        >
          In USD
        </button>
        <button
          type="button"
          onClick={() => setInputMode("qty")}
          className={cn(
            "px-3 py-1 rounded-lg transition-all",
            inputMode === "qty"
              ? "bg-xc-purple/30 text-white"
              : "text-xc-muted hover:text-white",
          )}
        >
          In {asset.symbol}
        </button>
      </div>

      {/* Amount input */}
      {inputMode === "amount" ? (
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
              min="1"
              step="0.01"
              required
              className="w-full bg-xc-dark/60 border border-xc-border rounded-xl pl-7 pr-4 py-3 text-sm font-mono text-white placeholder:text-xc-muted/50 focus:outline-none focus:border-xc-purple/60 transition-colors"
            />
          </div>
          {side === "buy" && (
            <div className="flex gap-2 mt-2">
              {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickAmount(pct)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-xc-muted hover:text-white transition-all"
                >
                  {pct * 100}%
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-xc-muted mb-1.5">
            Quantity ({asset.symbol})
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0.0000"
            min="0.0001"
            step="0.0001"
            required
            className="w-full bg-xc-dark/60 border border-xc-border rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-xc-muted/50 focus:outline-none focus:border-xc-purple/60 transition-colors"
          />
        </div>
      )}

      {/* Order summary */}
      <div className="bg-xc-dark/40 border border-xc-border rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-xc-muted">Estimated quantity</span>
          <span className="font-mono text-white">
            {estimatedQty.toFixed(4)} {asset.symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xc-muted">Estimated cost</span>
          <span className="font-mono text-white">
            {formatCurrency(estimatedCost)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xc-muted">Available cash</span>
          <span
            className={cn(
              "font-mono",
              hasSufficientFunds ? "text-xc-green" : "text-xc-red",
            )}
          >
            {formatCurrency(availableCash)}
          </span>
        </div>
      </div>

      {/* Insufficient funds warning */}
      {side === "buy" && !hasSufficientFunds && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-700/40 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Insufficient funds. Add cash to your wallet to continue.
        </div>
      )}

      {/* Feedback message */}
      {message && (
        <div
          className={cn(
            "flex items-center gap-2 text-xs rounded-xl px-3 py-2",
            message.type === "success"
              ? "text-xc-green bg-emerald-950/30 border border-emerald-700/40"
              : "text-xc-red bg-red-950/30 border border-red-700/40",
          )}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        variant={side === "buy" ? "primary" : "danger"}
        fullWidth
        loading={loading}
        disabled={!hasSufficientFunds && side === "buy"}
        size="lg"
      >
        {side === "buy" ? "Place Buy Order" : "Place Sell Order"}
      </Button>

      <p className="text-xs text-xc-muted text-center">
        Market orders execute at current prices. By trading, you agree to
        X-CAPITAL Terms of Service.
      </p>
    </form>
  );
}
