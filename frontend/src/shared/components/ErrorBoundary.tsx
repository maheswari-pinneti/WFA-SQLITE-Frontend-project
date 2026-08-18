import { Component, ErrorInfo, ReactNode } from 'react';
import { ServerCrash, RefreshCw } from 'lucide-react';
import { StacklyLogo } from '../../components/common/StacklyLogo';

interface Props {
  children?: ReactNode;
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
    console.error('Stackly UI Exception Boundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans">
          <div className="glass-panel p-8 max-w-md text-center backdrop-blur-xl bg-slate-900/90 border-slate-800 shadow-2xl space-y-5">
            <div className="flex justify-center">
              <StacklyLogo size={40} showText={true} />
            </div>

            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <ServerCrash size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold">Unexpected Exception Caught</h2>
              <p className="text-xs text-slate-400">
                An isolated UI rendering exception occurred. The application state has been safely preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-rose-400 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={() => window.location.assign('/')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Recover Application State
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
