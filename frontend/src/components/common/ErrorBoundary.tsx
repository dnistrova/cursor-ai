import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-[400px] flex items-center justify-center p-8"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-100 dark:bg-rose-900/30 
                            flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-rose-600 dark:text-rose-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We encountered an unexpected error. Please try again or refresh the page.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-rose-600 dark:text-rose-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white 
                          font-medium rounded-lg transition-colors focus:outline-none 
                          focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 
                          dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 
                          font-medium rounded-lg transition-colors focus:outline-none 
                          focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback UI component for specific sections
export function ErrorFallback({ 
  message = 'Failed to load this section',
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void;
}) {
  return (
    <div 
      className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800"
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg 
            className="w-6 h-6 text-rose-600 dark:text-rose-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-rose-800 dark:text-rose-200">
            Error
          </h3>
          <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-rose-600 dark:text-rose-400 
                        hover:text-rose-500 dark:hover:text-rose-300 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

