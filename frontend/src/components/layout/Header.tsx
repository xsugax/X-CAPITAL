'use client';

import { Bell, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, wallet } = useStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-xc-dark/80 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-xc-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Balance pill */}
        {wallet && (
          <div className="hidden md:flex items-center gap-2 glass border border-white/5 rounded-full px-4 py-1.5 text-sm">
            <span className="text-xc-muted text-xs">Balance</span>
            <span className="font-mono font-bold text-xc-green">
              {formatCurrency(Number(wallet.fiatBalance))}
            </span>
          </div>
        )}

        {/* Search */}
        <button className="w-9 h-9 glass border border-white/5 rounded-full flex items-center justify-center text-xc-muted hover:text-white transition-colors">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 glass border border-white/5 rounded-full flex items-center justify-center text-xc-muted hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-xc-purple rounded-full" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-xc-purple to-xc-cyan flex items-center justify-center cursor-pointer">
            <span className="text-white text-xs font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
