import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { clipString } from '@libs/utils';

type BreadCrumbMenuProps = {
  prevReposHref: string | null;
  pathname:string;
  baseUrl: string;
  branch:string;
  commit:string;
};

type ArrayPath = {
  name: string;
  path: string;
};

const elementsCreator = (
  baseUrl: string, urlElements: ArrayPath[]
) => urlElements
  .map((el, i, arr) => (
    <Breadcrumb.Item>
      {
        i !== arr.length - 1
          ? <Link to={`${baseUrl}${el.path}`}>{el.name}</Link>
          : el.name
      }
    </Breadcrumb.Item>
  ));

const hrefCreator = (
  path: string[], elements: ArrayPath[] = []
):ArrayPath[] => {
  if (!path.length) return elements;
  const newPath = [...path];
  const name = newPath.shift() as typeof path[number];
  const element = {
    name,
    path: `${elements.length ? elements[elements.length - 1].path : ''}/${name}`
  };
  return hrefCreator(newPath, [...elements, element]);
};

const BreadCrumbMenu = ({
  prevReposHref, pathname, baseUrl, branch, commit
}:BreadCrumbMenuProps) => {
  const root = `${baseUrl}/${branch}/${commit}`;

  let treePath = clipString(pathname, `${root}/`);
  treePath = pathname !== treePath ? treePath : '';

  const pathElements = hrefCreator(treePath.split('/'));

  const replacedRoot = root.replace('blob', 'tree');
  // TODO: DANIK refactor all calculations into one function

  return (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Link to={prevReposHref || '/repos/all/1'}>
          <HomeOutlined />
        </Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={replacedRoot}>root</Link>
      </Breadcrumb.Item>
      {elementsCreator(replacedRoot, pathElements)}
    </Breadcrumb>
  );
};

export default BreadCrumbMenu;
