import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[#0a0a0d] text-white">
          <div className="max-w-md w-full bg-[#121218] border border-[#272738] rounded-xs p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-white">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              An unexpected display issue occurred. You can safely reload the page or return to the main storefront.
            </p>

            {this.state.error && (
              <div className="text-[10px] font-mono p-2.5 bg-[#181822] text-[#e4e4e7] rounded-xs text-left truncate overflow-x-auto border border-[#232332]">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#272738] hover:border-[#d4af37] text-white text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
