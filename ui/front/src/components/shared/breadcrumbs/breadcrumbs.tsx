import { classNameList } from '@libs/utils';
import { Breadcrumb } from 'antd';
import styles from './breadcrumbs.module.scss';

type BreadCrumbsProps = {
  className?: string;
  children: React.ReactNode
};
export function BreadCrumbs({ className = '', children }:BreadCrumbsProps) {
  const combinedClassName = classNameList(styles.breadcrumb, className);

  return (
    <Breadcrumb className={combinedClassName}>
      {children}
    </Breadcrumb>
  );
}
