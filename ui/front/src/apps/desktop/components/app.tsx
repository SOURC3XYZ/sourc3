import { ErrorAlert } from '@components/shared';
import { AC } from '@libs/action-creators';
import { useDispatch, useSelector } from '@libs/redux';
import { useMemo } from 'react';
import {
  Navigate, Route, Routes, useNavigate
} from 'react-router-dom';
import { Auth } from './auth';
import Success from './auth/success/success';
import { Main } from './main';

function App() {
  const error = useSelector((state) => state.app.error);

  const dispatch = useDispatch();

  const resetErr = () => dispatch(AC.setError(null));

  const navigate = useNavigate();

  const onClick = () => {
    resetErr();
    navigate('/');
  };

  const routesData = [
    {
      path: '/',
      element: <Navigate replace to="auth/" />
    },
    {
      path: 'auth/*',
      element: <Auth />
    },
    {
      path: 'main/*',
      element: <Main />
    },
    {
      path: 'success/*',
      element: <Success />
    }
  ];

  const routes = useMemo(() => routesData.map(({ path, element }) => (
    <Route key={`path-${path}`} path={path} element={element} />
  )), []);

  const component = useMemo(() => (error
    ? <ErrorAlert onClick={onClick} error={error} />
    : <Routes>{routes}</Routes>), [error]);

  return component;
}

export default App;
