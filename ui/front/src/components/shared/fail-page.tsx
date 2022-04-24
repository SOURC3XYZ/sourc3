import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        !!isBtn && <Button onClick={back} type="primary">Back Home</Button>
      }
    />
  );
}

export default FailPage;
