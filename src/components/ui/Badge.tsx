interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

const variantStyles = {
  success: 'bg-success/20 text-success border-success/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  error: 'bg-destructive/20 text-destructive border-destructive/30',
  info: 'bg-accent/20 text-accent border-accent/30',
  neutral: 'bg-text-muted/20 text-text-secondary border-text-muted/30',
};

export default function Badge({ variant, children, pulse, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border
        ${variantStyles[variant]}
        ${pulse ? 'animate-pulse-dot' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
