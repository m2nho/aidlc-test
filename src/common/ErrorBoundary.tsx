import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.MODE === 'development';
      const errorMessage = isDevelopment
        ? this.state.error?.message || 'Unknown error'
        : '오류가 발생했습니다';

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
          data-testid="error-boundary-fallback"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                시스템 오류
              </h1>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              {isDevelopment && this.state.error?.stack && (
                <div className="mb-6 p-4 bg-gray-100 rounded text-left">
                  <pre className="text-xs text-gray-700 overflow-auto max-h-48">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              <button
                onClick={this.handleReset}
                className="btn btn-primary w-full"
                data-testid="error-boundary-reload-button"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
