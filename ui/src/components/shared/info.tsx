import { Typography } from 'antd';

type InfoProps = {
  message: string;
  link?:string
  title?:string;
};

const Info = ({ message, title, link }:InfoProps) => (
  <>
    {title && (
      <Typography.Text>
        {title}
      </Typography.Text>
    )}

    {link && (
      <Typography.Text type="secondary" copyable={{ text: link }}>
        {message}
      </Typography.Text>
    )}
  </>
);

export default Info;
