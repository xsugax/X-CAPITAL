import { cn } from "@/lib/utils";

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
        "rounded-2xl p-4 sm:p-5 lg:p-7 bg-xc-card border border-xc-border/80",
        glow && "glow-purple border-white/10",
        onClick && "cursor-pointer hover:border-white/20 transition-all",
        className,
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

export function StatCard({
  title,
  value,
  change,
  icon,
  className,
  subtitle,
}: StatCardProps) {
  const positive = change !== undefined && change >= 0;
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-xc-muted uppercase tracking-widest mb-2">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-black text-white font-num tracking-tight truncate">
            {value}
          </p>
          {subtitle && <p className="text-sm text-xc-muted mt-1">{subtitle}</p>}
          {change !== undefined && (
            <span
              className={cn(
                "text-sm font-black mt-1.5 inline-flex items-center gap-1 tabular-nums",
                positive ? "text-xc-green" : "text-xc-red",
              )}
            >
              {positive ? "▲" : "▼"} {positive ? "+" : ""}
              {Number(change ?? 0).toFixed(2)}%
            </span>
          )}
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-white/5 text-xc-muted">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
