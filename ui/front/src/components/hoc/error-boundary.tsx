import { FailPage } from '@components/shared';
import React from 'react';

type ErrorBoundaryProps = {
  children: JSX.Element
};

type ErrorBoundaryState = {
  hasError: boolean;
  // message: string;
};

class ErrorCatcher extends React
  .Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props:ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
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
    const { hasError } = this.state;
    const { children } = this.props;
    const { resetErrState } = this;
    if (hasError) return <FailPage resetErrState={resetErrState} />;
    return children;
  }
}

export default ErrorCatcher;
