import { Logged, Main } from '@components/pages';
import { AC } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { Alert, Button } from 'antd';
import { connect } from 'react-redux';
import {
  Navigate, Route, Routes, useNavigate
} from 'react-router-dom';
import { Desk } from './desk';

type AppProps = {
  error: {
    code?: number,
    status?: string
    message: string,
  } | null;
  resetErr: () => void
};

function App({ error, resetErr }: AppProps) {
  const navigate = useNavigate();
  const onClick = () => {
    resetErr();
    navigate('/');
  };
  return error
    ? (
      <Alert
        message="Error Text"
        showIcon
        description={error.message}
        type="error"
        action={(
          <Button onClick={onClick} size="small" type="default">
            Reload
          </Button>
        )}
      />
    )
    : (
      <Routes>
        <Route
          path="/"
          element={
            <Navigate replace to="auth/" />
          }
        />
        <Route
          path="auth/*"
          element={<Logged />}
        />
        <Route
          path="main/*"
          element={
            <Main />
          }
        />
        <Route
          path="mainDesk/*"
          element={
            <Desk />
          }
        />

      </Routes>
    );
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
