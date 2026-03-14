import { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

const toneStyles = {
  accent: {
    badge: 'border-accent/20 bg-accent/[0.12] text-accent',
    rail: 'from-accent/70 via-accent/25 to-transparent',
  },
  success: {
    badge: 'border-success/20 bg-success/[0.12] text-success',
    rail: 'from-success/70 via-success/25 to-transparent',
  },
  warning: {
    badge: 'border-warning/20 bg-warning/[0.12] text-warning',
    rail: 'from-warning/70 via-warning/25 to-transparent',
  },
  info: {
    badge: 'border-info/20 bg-info/[0.12] text-info',
    rail: 'from-info/70 via-info/25 to-transparent',
  },
  neutral: {
    badge: 'border-border/70 bg-surface-raised/70 text-text-secondary',
    rail: 'from-text-muted/60 via-text-muted/20 to-transparent',
  },
} as const;

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'accent',
}: {
  label: string;
  value: string | number;
  helper: string;
  icon?: ReactNode;
  tone?: keyof typeof toneStyles;
}) {
  const styles = toneStyles[tone];

  return (
    <Card className="rounded-[28px] border-border/70 bg-surface/90 transition-all hover:-translate-y-0.5 hover:border-accent/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="stat-value mt-5">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-2xl border',
            styles.badge,
          )}
        >
          {icon ?? <span className="h-2.5 w-2.5 rounded-full bg-current" />}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{helper}</p>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-surface-overlay/80">
        <div className={cn('h-full w-2/3 rounded-full bg-gradient-to-r', styles.rail)} />
      </div>
    </Card>
  );
}
