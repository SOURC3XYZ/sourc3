import React, { ReactElement } from 'react';

type ErrorBoundaryProps = {
  fallback: (props:any) => JSX.Element;
  children: ReactElement<any, any>
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class ErrorBoundary extends React
  .Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }

  shouldComponentUpdate(_:typeof this.props, nextState: typeof this.state) {
    const { hasError } = nextState;
    if (hasError) return false;
    return true;
  }

  private resetErrState = () => {
    const { hasError } = this.state;
    if (hasError) this.setState({ hasError: false });
  };

  render() {
    const { children, fallback } = this.props;
    const { hasError, message } = this.state;
    const { resetErrState } = this;
    if (hasError) {
      return fallback({ resetErrState, message });
    }
    return children;
  }
}

export default ErrorBoundary;
