'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, Briefcase, Globe, ShoppingBag, Wallet,
  Cpu, Home, ChevronLeft, ChevronRight, LogOut, Settings,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/trading', icon: BarChart3, label: 'Trading' },
  { href: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/funds', icon: Globe, label: 'Funds & SPVs' },
  { href: '/commerce', icon: ShoppingBag, label: 'Commerce' },
  { href: '/oracle', icon: Cpu, label: 'AI Oracle' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

const TIER_STYLES: Record<string, string> = {
  CORE: 'bg-white/10 text-white',
  GOLD: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  BLACK: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, user, logout } = useStore();

  return (
    <aside className={cn(
      'fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 glass border-r border-white/5',
      sidebarOpen ? 'w-60' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-xc-purple to-xc-cyan flex items-center justify-center">
          <span className="text-white font-black text-xs">X</span>
        </div>
        {sidebarOpen && (
          <span className="font-black text-base tracking-tight text-white">X-CAPITAL</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-xc-purple/20 text-xc-purple-light border border-purple-700/30'
                  : 'text-xc-muted hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-xc-purple-light' : 'text-current')} />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {user && (
        <div className="border-t border-white/5 p-3 space-y-2">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-xc-purple to-xc-cyan flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className={cn('inline-block text-xs px-1.5 py-0.5 rounded-full font-mono font-bold', TIER_STYLES[user.tier])}>
                  {user.tier}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-xc-purple to-xc-cyan flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user.firstName[0]}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Link href="/settings"
              className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-xc-muted hover:text-white hover:bg-white/5 transition-all text-sm', sidebarOpen ? 'flex-1' : 'w-full justify-center')}
            >
              <Settings className="w-4 h-4" />
              {sidebarOpen && 'Settings'}
            </Link>
            <button
              onClick={logout}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-xc-muted hover:text-xc-red hover:bg-red-950/30 transition-all text-sm', sidebarOpen ? 'flex-1' : 'w-full justify-center')}
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && 'Logout'}
            </button>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-xc-card border border-xc-border text-xc-muted hover:text-white transition-colors flex items-center justify-center"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  );
}
