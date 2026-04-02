import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl p-6 bg-xc-card border border-xc-border',
        glow && 'glow-purple border-purple-700/30',
        onClick && 'cursor-pointer hover:border-purple-700/40 transition-all',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export function StatCard({ title, value, change, icon, className, subtitle }: StatCardProps) {
  const positive = change !== undefined && change >= 0;
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-xc-muted uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-black text-white font-num">{value}</p>
          {subtitle && <p className="text-xs text-xc-muted mt-1">{subtitle}</p>}
          {change !== undefined && (
            <span className={cn('text-sm font-semibold mt-1 inline-block', positive ? 'text-xc-green' : 'text-xc-red')}>
              {positive ? '+' : ''}{change.toFixed(2)}%
            </span>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-xl bg-white/5 text-xc-muted">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
