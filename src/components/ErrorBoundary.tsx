import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-2">
            <p className="text-gray-600">發生未預期的錯誤</p>
            <button
              className="text-sm text-orange-500 hover:underline"
              onClick={() => this.setState({ hasError: false })}
            >
              重新嘗試
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
