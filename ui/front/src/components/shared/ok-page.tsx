import { Result } from 'antd';

type OkPageProps = {
  subTitle: string;
};

const OkPage = ({ subTitle }:OkPageProps) => (
  <Result
    status="success"
    title="Success"
    subTitle={subTitle}
  />
);

export default OkPage;
