import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button, Card } from '../ui/UIComponents';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-zinc-900">Oops, something went wrong!</h1>
              <p className="text-sm text-zinc-500">
                Aplikasi mengalami masalah teknis dan tidak dapat memuat halaman ini.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-50 text-red-700 text-xs text-left p-3 rounded-lg overflow-x-auto border border-red-100">
                <code>{this.state.error.message}</code>
              </div>
            )}

            <Button
              variant="primary"
              className="w-full justify-center gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="w-4 h-4" />
              Muat Ulang Halaman (Reload)
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
