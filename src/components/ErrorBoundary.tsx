import {AlertTriangle, RotateCcw} from 'lucide-react';
import {Component, type ErrorInfo, type ReactNode} from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({error, errorInfo});
    console.error('[Pad2PS ErrorBoundary]', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      window.localStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const message = this.state.error?.message || 'Erro desconhecido ao renderizar a interface.';
    const stack = this.state.error?.stack || this.state.errorInfo?.componentStack || '';

    return (
      <div className="min-h-dvh w-full bg-[#09090B] text-[#FAFAFA] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-xl rounded-2xl bg-[#121216] border p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85)] flex flex-col gap-4"
          style={{borderColor: 'rgba(var(--accent-rgb, 255, 46, 147), 0.45)'}}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.16)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#F87171',
              }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[#FAFAFA]">
                Erro ao inicializar o Pad2PS
              </h1>
              <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
                Ocorreu uma falha inesperada na interface. Você pode recarregar ou restaurar as preferências locais.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#09090B] border border-zinc-800 p-3.5 space-y-2">
            <p className="font-mono text-xs text-rose-300 break-words">{message}</p>
            {stack && (
              <pre className="font-mono text-[11px] text-zinc-400 whitespace-pre-wrap break-words max-h-48 overflow-y-auto pt-2 border-t border-zinc-800/80">
                {stack}
              </pre>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="px-3.5 py-2 rounded-lg border border-zinc-700 bg-[#09090B] hover:bg-zinc-900 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              Limpar Preferências & Recarregar
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110 cursor-pointer"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb, 255, 46, 147), 0.28)',
                border: '1px solid var(--accent-color, #FF2E93)',
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recarregar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
