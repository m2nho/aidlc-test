import Button from './Button';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  message,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <p className="mb-6 text-lg text-gray-600">{message}</p>
      {actionLabel && onAction && (
        <Button label={actionLabel} onClick={onAction} variant="primary" />
      )}
    </div>
  );
}
