export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[22px] border border-border/60 bg-[linear-gradient(90deg,hsl(var(--surface-raised))/0.9,hsl(var(--surface-overlay))/0.92,hsl(var(--surface-raised))/0.9)] ${className}`}
    />
  );
}
