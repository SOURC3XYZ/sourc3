import useFetch from '@libs/hooks/shared/useTimeoutFetch';
import { PromiseArg } from '@types';
import { Progress, Typography } from 'antd';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sourc3Logo } from '@components/svg';
import { BackButton } from '@components/shared/back-button';
import styles from './updating.module.scss';

const { Text } = Typography;

type UpdatingNodeProps = {
  statusFetcher: (resolve: PromiseArg<{ status: number }>) => void,
  errorCatcher: (e: Error) => void,
  back: ()=>void,
};

const initial = { status: 0 }; // need to cycle rerender component

function UpdatingNode({
  statusFetcher, errorCatcher, back
}:UpdatingNodeProps) {
  const navigate = useNavigate();
  const { status } = useFetch(statusFetcher, initial, errorCatcher);
  console.log('updating node: ', status);
  const location = useLocation();
  const login = location.pathname === '/auth/login';
  const restored = location.pathname === '/auth/restore';
  useEffect(() => {
    if (status === 100 && restored) navigate('/success', { state: { restore: true } });
    else if (status === 100 && login) navigate('/repos/all/1', { state: { restore: true } });
    else if (status === 100) {
      navigate('/success', { state: { restore: false } });
    }
  }, [status]);

  return (

    <>
      <BackButton onClick={back} />
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <Sourc3Logo fill="black" />
          <h3>desktop client</h3>
        </div>
        <div className={styles.intro}>
          <Text style={{
            color: 'rgba(0, 0, 0, 0.5)',
            fontFamily: 'PublicSans-Regular',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '19px',
            textAlign: 'center',
            letterSpacing: '0.1px'
          }}
          >
            Unpacking blockchain info (
            {status}
            %
            )
          </Text>
          <div className={styles.statusBar}>
            <Progress
              type="line"
              strokeColor={{
                from: '#3FD05A',
                to: '#3FD05A'
              }}
              showInfo={false}
              percent={status}
              status="active"
              strokeWidth={6}
              trailColor="rgba(0, 0, 0, 0.1)"
            />
          </div>
        </div>
      </div>

    </>

  );
}

export default UpdatingNode;
