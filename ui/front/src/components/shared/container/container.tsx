import { classNameList } from '@libs/utils';
import { HTMLAttributes } from 'react';
import styles from './container.module.scss';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Container(props: ContainerProps) {
  const { className, children } = props;
  const combinedStyles = classNameList(styles.container, className || '');

  return <div className={combinedStyles}>{children}</div>;
}
