import { Route, Routes } from 'react-router-dom';
import {
  Notifications,
  Preload,
  DownloadPage, NavButton, FailPage
} from '@components/shared';
import { PreloadComponent } from '@components/hoc';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { LoadingMessages } from '@libs/constants';
import { useWebMain } from '@libs/hooks/container/web-app';
import { ErrorBoundary } from '@components/context';
import GitAuth from '@components/shared/git-auth/gitAuth';
import axios from 'axios';
import { HOST } from '@components/shared/git-auth/profile/constants';
import { AC } from '@libs/action-creators';
import ProfileGit from '@components/shared/git-auth/profile/profileGit';
import { useDispatch } from '@libs/redux';
import OnboardingStep from '@components/shared/git-auth/onboarding/onboardingStep';
import { Popup } from '@components/shared/popup';
import { AchievementList } from '@components/shared/achievments';
import ReferralProgramm from '@components/shared/referral-programm/referralProgramm';
import { Footer } from './footer';
import styles from './app.module.scss';
import { Lendos } from './lendos';
import { Header } from './header';
import { routesData } from './routes';

function Main() {
  const { isApiConnected, isOnLending, connectBeamApi } = useWebMain();
  const dispatch = useDispatch();
  const token = window.localStorage.getItem('token');
  const [isVisible, setVisible] = useState(false);
  // const [isDisabled, setIsDisabled] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const HeadlessPreloadFallback = useCallback(() => (
    <Preload
      isOnLendos={isOnLending}
      message={LoadingMessages.HEADLESS}
    />
  ), [isOnLending]);

  useEffect(() => {
    if (window.localStorage.getItem('token')) {
      axios.get(`${HOST}/login?access_token=${token}`)
        .then((res) => {
          try {
            if (res.status >= 200 && res.status < 300) {
              axios({
                method: 'get',
                url: `${HOST}/user`,
                withCredentials: false,
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${window.localStorage.getItem('token')}`
                }
              })
                .then((result) => {
                  dispatch(AC.getAuthGitUser(result));
                })
                .catch((err) => (console.log(err)));
            }
          } catch (e) {
            if (e) {
              setVisible(true);
              setIsErr(true);
            }
          }
        })
        .catch((e) => {
          if (e) {
            setVisible(true);
            setIsErr(true);
          }
        });
    }
  }, []);

  const routes = useMemo(() => (
    <PreloadComponent
      Fallback={HeadlessPreloadFallback}
      callback={connectBeamApi}
      isLoaded={isApiConnected}
    >
      <Routes>
        {
          routesData
            .map((
              { path, element: Element }
            ) => (
              <Route
                key={`route-${path}`}
                path={path}
                element={<Element />}
              />
            ))
        }
      </Routes>

    </PreloadComponent>
  ), [isApiConnected, isOnLending]);

  return (
    <>
      <Routes>
        <Route
          path="/git-auth"
          element={<GitAuth />}
        />
        <Route
          path="/onboarding"
          element={<OnboardingStep />}
        />
        <Route
          path="/download"
          element={<DownloadPage />}
        />
        <Route
          path="/profile/:id"
          element={<ProfileGit />}
        />
        <Route
          path="/*"
          element={(
            <>
              <div className={styles.appWrapper}>
                <Header isOnLending={isOnLending} />
                <div className={styles.main}>
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<Lendos />} />
                      <Route
                        path="/referral-programm"
                        element={<ReferralProgramm />}
                      />
                      {/* <Route path="/*" element={routes} /> */}
                      <Route path="/*" element={<FailPage />} />

                    </Routes>
                  </ErrorBoundary>
                  <Notifications />
                </div>
              </div>
              <Footer isOnLending={isOnLending} />
            </>
          )}
        />

      </Routes>
      <Popup
        visible={isVisible}
        title={isErr ? 'Failed to connect with Github' : 'You are connected'}
        onCancel={() => (setVisible(false))}
        agree
        confirmButton={(
          <NavButton
            name="Ok"
            inlineStyles={{ width: '278px' }}
            onClick={() => (setVisible(false))}
            active
          />
        )}
      >
        <span>
          {isErr ? 'Login failed, please connect via GitHub again' : 'Thank you. You are connected'}
        </span>
      </Popup>
    </>
  );
}

export default Main;
