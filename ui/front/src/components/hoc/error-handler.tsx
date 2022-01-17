import { FailPage } from '@components/shared';
import React, { ReactElement } from 'react';

type ErrorBoundaryProps = {
  children: ReactElement<any, any>
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class ErrorBoundary extends React.Component {
  // eslint-disable-next-line react/sort-comp
  state:ErrorBoundaryState = { hasError: false, message: '' };

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props:ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }

  // eslint-disable-next-line consistent-return
  shouldComponentUpdate() {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.hasError) return false;
    return true;
  }

  resetState = () => {
  // eslint-disable-next-line react/destructuring-assignment
    if (this.state.hasError) this.setState({ hasError: false });
  };

  render() {
    const { children } = this.props;
    const { hasError, message } = this.state;
    if (hasError) {
      return <FailPage callback={this.resetState} subTitle={message} />;
    }
    return children;
  }
}

export default ErrorBoundary;
