"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ChatErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("chat render crash", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-3xl p-6 text-sm">
          <div className="bg-destructive/10 text-destructive rounded-md border p-4">
            Não foi possível exibir a conversa. Recarregue para recuperar.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
