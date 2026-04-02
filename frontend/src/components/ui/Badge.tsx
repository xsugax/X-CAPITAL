import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-white/10 text-white',
  success: 'bg-emerald-950/50 text-xc-green border border-emerald-800/30',
  danger: 'bg-red-950/50 text-xc-red border border-red-800/30',
  warning: 'bg-amber-950/50 text-xc-gold-light border border-amber-800/30',
  info: 'bg-cyan-950/50 text-xc-cyan border border-cyan-800/30',
  purple: 'bg-purple-950/50 text-xc-purple-light border border-purple-800/30',
  gold: 'bg-amber-950/50 text-xc-gold-light border border-amber-600/30',
};

const sizes: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full font-medium font-mono', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
