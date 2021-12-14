import { Typography } from 'antd';

type InfoProps = {
  message: string;
};

const Info = ({ message }:InfoProps) => <Typography.Text>{message}.</Typography.Text>;

export default Info;
