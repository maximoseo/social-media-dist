export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-surface-raised rounded-lg ${className}`} />
  );
}
