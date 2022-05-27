import { Typography } from 'antd';
import img from '@assets/img/copy.svg';
import styles from './info.module.scss';

type InfoProps = {
  message: string;
  link?:string
  title?:string;
};

const Info = ({ message, title, link }:InfoProps) => (
  <>
    {title && (
      <span className={styles.title}>
        {title}
      </span>
    )}

    {link && (
      <Typography.Text
        className={styles.message}
        type="secondary"
        copyable={{ text: link, icon: <img alt="copy" src={img} /> }}
      >
        {message}
      </Typography.Text>
    )}
  </>
);

export default Info;
