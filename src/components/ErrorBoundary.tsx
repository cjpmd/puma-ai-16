
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: false }; // We don't want to show error UI for ResizeObserver warnings
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log errors that aren't ResizeObserver warnings
    if (!error.message.includes('ResizeObserver')) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
