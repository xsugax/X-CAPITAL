"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn, formatCurrency, formatPercent, getChangeColor } from "@/lib/utils";

interface PortfolioChartProps {
  data: Array<{ date: string; value: number }>;
  height?: number;
}

const PERIODS = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: 0 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-xc-card border border-xc-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-xc-muted mb-0.5">{label}</p>
        <p className="text-sm font-mono font-bold text-white">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PortfolioChart({
  data,
  height = 200,
}: PortfolioChartProps) {
  const [activePeriod, setActivePeriod] = useState("1M");

  const filtered = (() => {
    const period = PERIODS.find((p) => p.label === activePeriod);
    if (!period || period.days === 0) return data;
    return data.slice(-period.days);
  })();

  const pctChange =
    filtered.length > 1
      ? ((filtered[filtered.length - 1].value - filtered[0].value) /
          filtered[0].value) *
        100
      : 0;

  const positive = pctChange >= 0;

  return (
    <div>
      {/* Mini stats row */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn("text-sm font-bold", getChangeColor(pctChange))}>
          {positive ? "+" : ""}
          {formatPercent(pctChange)}
          <span className="text-xc-muted font-normal ml-1.5">
            ({activePeriod})
          </span>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setActivePeriod(p.label)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                activePeriod === p.label
                  ? "bg-xc-purple text-black font-bold"
                  : "text-xc-muted hover:text-white hover:bg-white/5",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filtered}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <defs>
              <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={positive ? "#10b981" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={positive ? "#10b981" : "#ef4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(Number(v ?? 0) / 1000).toFixed(0)}k`}
              domain={["auto", "auto"]}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={positive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill="url(#portGrad)"
              dot={false}
              activeDot={{
                r: 4,
                fill: positive ? "#10b981" : "#ef4444",
                strokeWidth: 0,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
