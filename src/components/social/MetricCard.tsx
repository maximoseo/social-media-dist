import { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

const toneStyles = {
  accent: {
    badge: 'border-accent/20 bg-accent/[0.12] text-accent',
    border: 'border-l-accent/60',
  },
  success: {
    badge: 'border-success/20 bg-success/[0.12] text-success',
    border: 'border-l-success/60',
  },
  warning: {
    badge: 'border-warning/20 bg-warning/[0.12] text-warning',
    border: 'border-l-warning/60',
  },
  info: {
    badge: 'border-info/20 bg-info/[0.12] text-info',
    border: 'border-l-info/60',
  },
  neutral: {
    badge: 'border-border/70 bg-surface-raised/70 text-text-secondary',
    border: 'border-l-border/60',
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
    <Card className={cn('rounded-2xl border-border/70 border-l-2 bg-surface/90 transition-all hover:-translate-y-0.5 hover:border-accent/20', styles.border)} padding="sm">
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
    </Card>
  );
}
