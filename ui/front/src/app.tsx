import { Logged, Main } from '@components/page';
import { Navigate, Route, Routes } from 'react-router-dom';

const App = () => (
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

export default App;
