import { Route, Routes } from 'react-router-dom';
import { Login, Start, SignUp } from './content';
import styles from './logged.module.css';

function Logged() {
  return (
    <>
      <div className={styles.logged}>
        <Routes>
          <Route
            path="/"
            element={<Start />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/sign-up"
            element={<SignUp />}
          />
        </Routes>
      </div>
    </>
  );
}

export default Logged;
