import { NavButton } from '@components/shared';
import useFetch from '@libs/hooks/shared/useFetch';
import { PromiseArg } from '@types';
import { Progress, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

type UpdatingNodeProps = {
  backButton?: boolean;
  statusFetcher: (resolve: PromiseArg<{ status: number }>) => void,
  errorCatcher: (e: Error) => void
};

const initial = { status: 0 }; // need to cycle rerender component

function UpdatingNode({ backButton, statusFetcher, errorCatcher }:UpdatingNodeProps) {
  const navigate = useNavigate();
  const { status } = useFetch(statusFetcher, initial, errorCatcher);
  console.log('updating node: ', status);

  useEffect(() => {
    if (status === 100) navigate('/main');
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
    <>
      <Text style={{
        color: 'rgba(0, 0, 0, 0.3)',
        display: 'block',
        margin: '0 auto 30px',
        textAlign: 'center'
      }}
      >
        Unpacking blockchain info
      </Text>
      <Progress
        strokeColor={{
          from: '#3FD05A',
          to: '#3FD05A'
        }}
        showInfo
        percent={status}
        status="active"
      />
      {backBtn}
    </>
  );
}

export default UpdatingNode;
