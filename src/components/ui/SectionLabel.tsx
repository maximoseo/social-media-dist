interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <h2 className={`text-caption font-semibold text-text-secondary uppercase tracking-wider mb-3 ${className}`}>
      {children}
    </h2>
  );
}
