import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type FailPageProps = {
  subTitle: string;
  callback?: () => void
  title?: string;
  isBtn?: boolean;
};

const FailPage = ({
  title, subTitle, isBtn, callback
}:FailPageProps) => {
  const navigate = useNavigate();

  React.useEffect(() => callback);

  const back = () => navigate(-1);
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
};

export default FailPage;
