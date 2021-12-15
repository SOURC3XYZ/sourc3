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
      <Typography.Link href={`mailto:${link}`} target="_blank">
        {message}
      </Typography.Link>
    )}
  </>
);

export default Info;
