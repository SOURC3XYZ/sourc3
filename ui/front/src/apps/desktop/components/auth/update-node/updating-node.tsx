import { NavButton } from '@components/shared';
import useFetch from '@libs/hooks/shared/useFetch';
import { PromiseArg } from '@types';
import { Progress, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sourc3Logo } from '@components/svg';
import styles from './updating.module.scss';

const { Text } = Typography;

type UpdatingNodeProps = {
  backButton?: boolean;
  statusFetcher: (resolve: PromiseArg<{ status: number }>) => void,
  errorCatcher: (e: Error) => void,
};

const initial = { status: 0 }; // need to cycle rerender component

function UpdatingNode({
  backButton, statusFetcher, errorCatcher
}:UpdatingNodeProps) {
  const navigate = useNavigate();
  const { status } = useFetch(statusFetcher, initial, errorCatcher);
  console.log('updating node: ', status);
  const location = useLocation();
  const restored = location.pathname === '/auth/restore';
  useEffect(() => {
    if (status === 100 && restored) navigate('/success', { state: { restore: true } });
    else if (status === 100) {
      navigate('/success', { state: { restore: false } });
    }
  }, [status]);

  const backBtn = useMemo(() => (
    !!backButton && (
      <div style={{ margin: '157px auto 0' }}>
        <NavButton
          inlineStyles={{
            display: 'block',
            width: '278px',
            margin: '0 auto',
            color: 'rgba(0, 0, 0, 0.3)',
            borderColor: 'rgba(0, 0, 0, 0.3)'
          }}
          name="Back"
          link="/auth/"
        />
      </div>
    )
  ), []);

  return (
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
          />
        </div>
        {backBtn}
      </div>
    </div>
  );
}

export default UpdatingNode;
