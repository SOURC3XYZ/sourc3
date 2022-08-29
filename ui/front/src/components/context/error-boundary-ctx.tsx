import { ErrorCatcher } from '@components/hoc';
import { useAsyncError } from '@libs/hooks/shared';
import { ErrorBoundaryContext } from './shared-context';

type ErrorBoundaryProps = {
  children: JSX.Element
};

function ErrorThrower({ children }:ErrorBoundaryProps) {
  const setError = useAsyncError();

  return (
    <ErrorBoundaryContext.Provider value={setError}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
}

export function ErrorBoundary({ children }:ErrorBoundaryProps) {
  return (
    <ErrorCatcher>
      <ErrorThrower>
        {children}
      </ErrorThrower>
    </ErrorCatcher>
  );
}
