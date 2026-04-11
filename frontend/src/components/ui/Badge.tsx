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
  warning: 'bg-white/[0.03]/50 text-xc-gold-light border border-amber-800/30',
  info: 'bg-white/[0.02]/50 text-xc-cyan border border-white/[0.06]/30',
  purple: 'bg-white/[0.02]/50 text-white/70 border border-white/[0.08]',
  gold: 'bg-white/[0.03]/50 text-xc-gold-light border border-white/[0.10]/30',
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
