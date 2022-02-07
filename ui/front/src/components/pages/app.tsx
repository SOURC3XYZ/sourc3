import { Logged, Main } from '@components/pages';
import { RootState } from '@libs/redux';
import { Alert } from 'antd';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';

type AppProps = {
  error: {
    code?: number,
    status?: string
    message: string,
  } | null
};

function App({ error }: AppProps) {
  return error
    ? (
      <Alert
        message="Error Text"
        showIcon
        description={error.message}
        type="error"
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

      </Routes>
    );
}

const mapState = ({ app: { error } }:RootState) => ({
  error
});

export default connect(mapState)(App);
