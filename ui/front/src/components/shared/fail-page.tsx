import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

type FailPageProps = {
  title?: string;
  subTitle: string;
};

const FailPage = ({ title, subTitle }:FailPageProps) => {
  const navigate = useNavigate();

  const back = () => navigate(-1);
  return (
    <Result
      status="404"
      title={title}
      subTitle={subTitle}
      extra={<Button onClick={back} type="primary">Back Home</Button>}
    />
  );
};

export default FailPage;
