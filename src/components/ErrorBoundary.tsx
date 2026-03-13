'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { Card, Button } from './ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send error to error tracking service
    // trackError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Card>
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>

            <h2 className="text-xl font-bold text-text-primary mb-2">
              Something went wrong
            </h2>

            <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
              An unexpected error occurred. This has been logged and our team has been notified.
            </p>

            {this.state.error && (
              <details className="mb-4 text-left max-w-md mx-auto">
                <summary className="text-caption text-text-muted cursor-pointer hover:text-text-secondary mb-2">
                  Show error details
                </summary>
                <div className="p-3 bg-background border border-border rounded-lg mt-2">
                  <p className="text-caption text-destructive font-mono break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="text-caption text-text-muted mt-2 font-mono text-xs">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              </details>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to programmatically trigger error boundary
 * Useful for handling async errors outside React's render cycle
 */
export function useErrorHandler() {
  return (error: Error) => {
    // Log the error
    console.error('Caught error:', error);

    // You could also send to error tracking service here
    // trackError(error);

    // Optionally show toast notification if toast system is available
    if (typeof window !== 'undefined') {
      // Dispatch custom event that ErrorBoundary could listen to
      window.dispatchEvent(new CustomEvent('react-error', { detail: error }));
    }
  };
}
