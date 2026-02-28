interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-start gap-2 p-3">
      <div className="flex items-center gap-2">
        <span className="text-bloomberg-negative font-bold text-xs">⚠ ERR</span>
        <span className="text-bloomberg-muted text-2xs">
          {message ?? "Failed to load data"}
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-2xs text-bloomberg-accent hover:text-bloomberg-accent-dim border border-bloomberg-accent px-2 py-0.5 hover:bg-bloomberg-accent/10 transition-colors"
        >
          RETRY
        </button>
      )}
    </div>
  );
}
