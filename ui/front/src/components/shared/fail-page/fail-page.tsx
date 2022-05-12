import { Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BeamButton } from '@components/shared';

type FailPageProps = {
  subTitle: string;
  comeBack?: string
  resetErrState?: () => void
  title?: string;
  isBtn?: boolean;
};

function FailPage({
  title, subTitle, comeBack, isBtn, resetErrState
}:FailPageProps) {
  const navigate = useNavigate();

  React.useEffect(() => resetErrState);

  const back = () => {
    if (comeBack !== undefined) return navigate(comeBack);
    return navigate(-1);
  };
  return (
    <Result
      status="404"
      title={title}
      subTitle={subTitle}
      extra={
        !!isBtn && <BeamButton callback={back}>Back Home</BeamButton>
      }
    />
  );
}

export default FailPage;
