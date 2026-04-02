'use client';

import { useState, useEffect } from 'react';
import { tradingAPI } from '@/lib/api';
import { formatCurrency, cn, getChangeColor, getAssetTypeColor } from '@/lib/utils';
import { Search, TrendingUp, TrendingDown, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Asset } from '@/types';

const ASSET_TYPES = ['ALL', 'STOCK', 'ETF', 'CRYPTO', 'TOKEN', 'FUND'];

interface AssetListProps {
  onSelect?: (asset: Asset) => void;
  selectedSymbol?: string;
}

export default function AssetList({ onSelect, selectedSymbol }: AssetListProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await tradingAPI.getAssets({ limit: 50 });
        setAssets(res.data.data.assets || []);
      } catch {
        setAssets(DEMO_ASSETS as Asset[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = assets.filter((a) => {
    const matchSearch =
      !search ||
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === 'ALL' || a.type === activeType;
    return matchSearch && matchType;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xc-muted" />
        <input
          type="text"
          placeholder="Search assets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-xc-dark/60 border border-xc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-xc-muted focus:outline-none focus:border-xc-purple/60 transition-colors"
        />
      </div>

      {/* Type filters */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {ASSET_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
              activeType === type
                ? 'bg-xc-purple text-white'
                : 'bg-white/5 text-xc-muted hover:text-white hover:bg-white/10',
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 mb-2">
        <span className="text-xs text-xc-muted font-medium">Asset</span>
        <span className="text-xs text-xc-muted font-medium text-right">Price</span>
        <span className="text-xs text-xc-muted font-medium text-right w-16">24h</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))
          : filtered.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => onSelect?.(asset)}
                className={cn(
                  'w-full grid grid-cols-[1fr_auto_auto] gap-4 items-center px-3 py-3 rounded-xl transition-all text-left',
                  selectedSymbol === asset.symbol
                    ? 'bg-xc-purple/20 border border-xc-purple/40'
                    : 'hover:bg-white/[0.04] border border-transparent',
                )}
              >
                {/* Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                    style={{
                      background: `linear-gradient(135deg, ${getAssetTypeColor(asset.type)}33, ${getAssetTypeColor(asset.type)}11)`,
                      border: `1px solid ${getAssetTypeColor(asset.type)}44`,
                    }}
                  >
                    {asset.symbol[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white">{asset.symbol}</div>
                    <div className="text-xs text-xc-muted truncate">{asset.name}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-sm font-mono font-bold text-white text-right">
                  {formatCurrency(Number(asset.price))}
                </div>

                {/* Change */}
                <div
                  className={cn(
                    'text-xs font-bold flex items-center justify-end gap-0.5 w-16',
                    getChangeColor(Number(asset.priceChange24h ?? 0)),
                  )}
                >
                  {Number(asset.priceChange24h ?? 0) >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(Number(asset.priceChange24h ?? 0)).toFixed(2)}%
                </div>
              </button>
            ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-xc-muted text-sm">No assets match your search.</div>
        )}
      </div>
    </div>
  );
}

const DEMO_ASSETS = [
  { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'STOCK', price: 248.42, priceChange24h: 3.21 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'STOCK', price: 875.39, priceChange24h: 2.15 },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCK', price: 213.07, priceChange24h: 0.54 },
  { symbol: 'META', name: 'Meta Platforms', type: 'STOCK', price: 513.92, priceChange24h: 2.77 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', type: 'STOCK', price: 196.25, priceChange24h: -0.82 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'STOCK', price: 422.86, priceChange24h: 1.04 },
  { symbol: 'PLTR', name: 'Palantir Technologies', type: 'STOCK', price: 23.47, priceChange24h: 4.55 },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'ETF', price: 44.18, priceChange24h: 1.33 },
  { symbol: 'XSPACE', name: 'X-SPACE Token', type: 'TOKEN', price: 12.50, priceChange24h: 5.12 },
  { symbol: 'XINFRA', name: 'X-INFRA Token', type: 'TOKEN', price: 8.75, priceChange24h: 2.88 },
  { symbol: 'XENERGY', name: 'X-ENERGY Token', type: 'TOKEN', price: 6.20, priceChange24h: -1.45 },
];
