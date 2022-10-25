/* eslint-disable no-case-declarations */
import { BreadCrumbs, Container } from '@components/shared';
import { usePathPattern } from '@components/shared/usePathPattern';
import { ROUTES } from '@libs/constants';
import { useSelector } from '@libs/redux';
import { Breadcrumb } from 'antd';
import { FC, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './breadcrumbs.module.scss';
import { orgLink, projectLinks, reposLinks } from './utils';

const baseRoutes = [
  `${ROUTES.ORG}/:orgName/*`,
  `${ROUTES.PROJECT}/:projectName/*`,
  `${ROUTES.REPO}/:repoParams/*`
];

type Params = 'orgName' | 'projectName' | 'repoParams';

export function EntityBreadCrumbs<T extends object>(Child: FC<T>) {
  return function (props:T) {
    const params = useParams<Params>();
    const path = usePathPattern(baseRoutes);

    const { projects, repos } = useSelector((state) => state.entities);

    const breadCrumbs = useMemo(() => {
      const [org, project, repo] = baseRoutes;
      let breadCrumbList: ({ path: string, name: string })[] | null = null;
      switch (path) {
        case org:
          breadCrumbList = orgLink(params.orgName as string);
          break;
        case project:
          breadCrumbList = projectLinks(projects, params.projectName as string);
          break;
        case repo:
          breadCrumbList = reposLinks(repos, params.repoParams as string);
          break;
        default:
      }
      if (breadCrumbList) {
        const view = breadCrumbList.map((el, i, arr) => (
          <Breadcrumb.Item key={`breadcrumb-item-${i}`}>
            {
              i !== arr.length - 1
                ? <Link to={`${el.path}`}>{el.name}</Link>
                : el.name
            }
          </Breadcrumb.Item>
        ));
        return (
          <BreadCrumbs>
            {view}
          </BreadCrumbs>
        );
      }
      return null;
    }, [path]);
    return (
      <>
        <Container className={styles.content}>
          {breadCrumbs}
        </Container>
        <Child {...props} />
      </>
    );
  };
}
