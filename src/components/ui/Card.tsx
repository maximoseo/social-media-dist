import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-2xl border border-border/80 bg-[linear-gradient(180deg,hsl(var(--surface))/0.98,hsl(var(--surface-raised))/0.94)] shadow-[0_16px_48px_-24px_rgba(0,0,0,0.6)] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/10 transition-shadow duration-200 hover:shadow-[0_20px_56px_-24px_rgba(0,0,0,0.7)]',
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
