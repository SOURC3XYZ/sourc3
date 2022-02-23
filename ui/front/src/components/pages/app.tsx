import { Logged, Main } from '@components/pages';
import { ErrorAlert } from '@components/shared';
import { AC } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { BeamError } from '@types';
import { useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import {
  Navigate, Route, Routes, useNavigate
} from 'react-router-dom';
import { Desk } from './desk';

type AppProps = {
  error: BeamError | null;
  resetErr: () => void
};

function App({ error, resetErr }: AppProps) {
  const navigate = useNavigate();

  const onClick = () => {
    resetErr();
    navigate('/');
  };

  const routes = [
    {
      path: '/',
      element: <Navigate replace to="auth/" />
    },
    {
      path: 'auth/*',
      element: <Logged />
    },
    {
      path: 'main/*',
      element: <Main />
    },
    {
      path: 'mainDesk/*',
      element: <Desk />
    }
  ];

  const routesRef = useRef(routes.map(({ path, element }) => (
    <Route path={path} element={element} />
  )));

  const View = useMemo(() => {
    const Component = error
      ? <ErrorAlert onClick={onClick} error={error} />
      : <Routes>{routesRef.current}</Routes>;
    return () => Component;
  }, [error]);

  return <View />;
}

const mapState = ({ app: { error } }:RootState) => ({
  error
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  resetErr: () => {
    dispatch(AC.setError(null));
  }
});

export default connect(mapState, mapDispatch)(App);
