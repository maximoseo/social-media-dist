import { Card } from '@/components/ui';

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card className="rounded-3xl border-border/70 bg-surface/90">
      <p className="eyebrow">{label}</p>
      <p className="stat-value mt-4">{value}</p>
      <p className="mt-3 text-sm text-text-secondary">{helper}</p>
    </Card>
  );
}
