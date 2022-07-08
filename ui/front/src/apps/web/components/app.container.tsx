import { Route, Routes } from 'react-router-dom';
import {
  Notifications,
  AllRepos,
  Preload,
  Repo,
  FailPage,
  Organizations,
  Projects,
  ProjectRepos
} from '@components/shared';
import { ErrorBoundary, PreloadComponent } from '@components/hoc';
import React, {
  useCallback, useMemo
} from 'react';
import { Footer } from 'antd/lib/layout/layout';
import { LoadingMessages } from '@libs/constants';
import { useWebMain } from '@libs/hooks/container/web-app';
import styles from './app.module.scss';
import { Lendos } from './lendos';
import { Header } from './header';
import discordIcon from "../../../assets/icons/discordIcon.svg";
import twitterIcon from "../../../assets/icons/twitterIcon.svg";
import DownloadPage from "../../../components/shared/download-page/download-page";

function Main() {
  const { isApiConnected, isOnLending, connectBeamApi } = useWebMain();

  const routesData = [
    {
      path: '/',
      element: <Lendos />
    },
    {
      path: 'repos/:type/:page',
      element: <AllRepos />
    },
    {
      path: 'repo/:repoParams/*',
      element: <Repo />
    },
    {
      path: 'organizations/:type/:page',
      element: <Organizations />
    },
    {
      path: 'projects/:orgId/:type/:page',
      element: <Projects />
    },
    {
      path: 'project/:projId/:type/:page',
      element: <ProjectRepos />
    },
    {
      path: 'download',
      element: <DownloadPage />
    },
    {
      path: '404',
      element: <FailPage />
    }
  ];

  const footerClassname = isOnLending ? styles.footer : styles.footerWhiteBg;

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: props.message || 'no data' };
    return <FailPage {...updatedProps} isBtn />;
  };

  const HeadlessPreloadFallback = useCallback(() => (
    <Preload
      isOnLendos={isOnLending}
      message={LoadingMessages.HEADLESS}
    />
  ), []);

  const routes = useMemo(() => (
    <Routes>
      {
        routesData
          .map((
            { path, element }
          ) => <Route key={`route-${path}`} path={path} element={element} />)
      }
    </Routes>
  ), [isApiConnected]);

  const SOCIAL = {
    DISCORD: "https://discord.gg/FpE9VfB6",
    TWITTER: "https://twitter.com/SOURC3xyz",
    SOURC3: "https://www.sourc3.xyz",
  };
  return (
    <PreloadComponent
      Fallback={HeadlessPreloadFallback}
      callback={connectBeamApi}
      isLoaded={isApiConnected}
    >
      <ErrorBoundary fallback={fallback}>
        <>
          <div className={styles.appWrapper}>
            <Header isOnLending={isOnLending} />
            <div className={styles.main}>
              {routes}
              <Notifications />
            </div>
          </div>
          <Footer className={footerClassname}>
            <div className={styles.content}>
              <div className={styles.icons}>
                <a href={SOCIAL.DISCORD}>
                  <img src={discordIcon} alt="discordIcon" />
                </a>
                <a href={SOCIAL.TWITTER}>
                  <img src={twitterIcon} alt="twitter" />
                </a>
              </div>
              <div className={styles.item}>
                <a href="mailto:Hello@SOURC3.xyz">
                  <h4>Contact us</h4>
                </a>
                <a href={SOCIAL.SOURC3} target="_blank">
                  <h4>© Sourc3</h4>
                </a>
              </div>
              {/*<h4>© 2022 by SOURC3</h4>*/}
            </div>
          </Footer>
        </>
      </ErrorBoundary>
    </PreloadComponent>

  );
}

export default Main;
