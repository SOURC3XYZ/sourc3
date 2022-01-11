import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import React from 'react';

// type BreadCrumbMenuProps = {
//   urlElements: string []
// };

type ArrayPath = {
  name: string;
  path: string;
};

const elementsCreator = (
  baseUrl: string, urlElements: ArrayPath[]
) => urlElements
  .map((el) => (
    <Breadcrumb.Item>
      <Link to={`${baseUrl}${el.path}`}>{el.name}</Link>
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

const BreadCrumbMenu = () => {
  const { pathname } = useLocation();
  const pathArray = pathname.split('/').splice(4);
  const pathElements = hrefCreator(pathArray);
  const baseUrl = pathname.split('/')
    .splice(0, 4)
    .map((el, i) => (i === 3 && el === 'blob' ? 'tree' : el))
    .join('/');

  return (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Link to="/repos/all/1">
          <HomeOutlined />
        </Link>
      </Breadcrumb.Item>
      {elementsCreator(baseUrl, pathElements)}
    </Breadcrumb>
  );
};

export default BreadCrumbMenu;
