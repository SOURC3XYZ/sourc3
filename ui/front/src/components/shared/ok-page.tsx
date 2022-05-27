import { Result } from 'antd';

type OkPageProps = {
  subTitle: string;
};

function OkPage({ subTitle }:OkPageProps) {
  return (
    <Result
      status="success"
      title="Success"
      subTitle={subTitle}
    />
  );
}

export default OkPage;
