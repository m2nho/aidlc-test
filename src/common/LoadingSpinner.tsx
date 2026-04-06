interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-12 w-12 border-4',
};

function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}
        data-testid="loading-spinner"
      />
      {message && (
        <p className="text-sm text-gray-600" data-testid="loading-message">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center z-50"
        data-testid="loading-spinner-fullscreen"
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
