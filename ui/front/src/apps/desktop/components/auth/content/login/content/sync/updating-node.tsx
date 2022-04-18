import { NavButton } from '@components/shared';
import { CONTRACT } from '@libs/constants';
import { useFetch } from '@libs/hooks';
import { Progress, Typography } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const url = `${CONTRACT.HOST}/wallet/update`;

type UpdatingNodeProps = {
  statusFetcher: (resolve: PromiseArg<{status: number}>) => void,
  errorCatcher: (e: Error) => void
};

const initial = { status: 0 }; // need to cycle rerender component

const UpdatingNode = ({statusFetcher, errorCatcher }:UpdatingNodeProps) => {
  const navigate = useNavigate();
  const { status } = useFetch(statusFetcher, initial, errorCatcher);
  console.log('updating node: ', status);

  useEffect(() => {
    if (status === 100) navigate('/main');
  }, [status]);

  return (
    <>
      <Text style={{ margin: '0 auto 30px' }}>
        Updating node
      </Text>
      <Progress
        strokeColor={{
          from: '#108ee9',
          to: '#87d068'
        }}
        percent={status}
        status="active"
      />
      <div style={{ margin: '30px auto 0' }}>
        <NavButton
          name="Back"
          link="/auth"
        />
      </div>
    </>
  );
};

export default UpdatingNode;
