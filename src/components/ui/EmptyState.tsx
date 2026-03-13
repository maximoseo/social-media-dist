interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

function DefaultIcon() {
  return (
    <svg className="w-12 h-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4">
        {icon || <DefaultIcon />}
      </div>
      <p className="text-heading-3 text-text-secondary mb-1">{title}</p>
      {description && (
        <p className="text-body-sm text-text-muted text-center max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-body-sm font-medium text-text-primary bg-surface-raised hover:bg-border rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
