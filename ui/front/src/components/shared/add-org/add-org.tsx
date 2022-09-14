import { MODAL } from '@libs/constants';
import { itemsFilter } from '@libs/hooks/container/organization/selectors';
import { useAddButton } from '@libs/hooks/container/wallet';
import { useSelector } from '@libs/redux';
// import useUserAsync from '@libs/hooks/thunk/useEntitiesAction';
import {
  Button, Menu, Dropdown
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './add.module.scss';
import { CreateRepos } from './content';
import { CreateOrg } from './content/create-org';
import { CreateProject } from './content/create-project';

function AddButton() {
  const {
    modal,
    showModal,
    handleCancel,
    handleOk
  } = useAddButton();

  const pkey = useSelector((state) => state.app.pkey);

  const items = useSelector((
    state
  ) => itemsFilter(state.entities.organizations, 'my', pkey));

  const dataDefault = [
    {
      title: 'Add new organization', mode: MODAL.ORGANIZATION, id: 'org'
    },
    {
      title: 'Add new project to organization', mode: MODAL.PROJECT, id: 'project', isDisabled: true
    },
    {
      title: 'Add new repository to project', mode: MODAL.REPOS, id: 'repos', isDisabled: true
    },
    { title: 'Add new user', isDisabled: true },
    { title: 'Add new project for user', isDisabled: true }
  ];

  const [data, setData] = useState(dataDefault);

  const { project } = useSelector(
    ({ entities }) => ({ project: entities.projects })
  );
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isInitialRenderProj, setIsInitialRenderProj] = useState(true);

  // todo Jenk: useCallback
  useEffect(() => {
    if (isInitialRender) {
      if (items.length > 0) {
        const newData = data.map((item) => {
          if (item.id === 'project') {
            item.isDisabled = false;
          }
          return item;
        });
        setData(newData);
        setIsInitialRender(false);
      }
    }
  }, [items, isInitialRender]);

  useEffect(() => {
    if (isInitialRenderProj) {
      if (project.length > 0) {
        const myOrg = project.filter(
          (org) => items.some((item) => item.organization_id === org.organization_id)
        );
        if (myOrg.length > 0) {
          const newData = data.map((item) => {
            if (item.id === 'repos') {
              item.isDisabled = false;
            }
            return item;
          });
          setData(newData);
          setIsInitialRenderProj(false);
        }
      }
    }
  }, [project, isInitialRenderProj]);

  const ModalView = useCallback(():JSX.Element | null => {
    switch (modal) {
      case MODAL.ORGANIZATION:
        return (
          <CreateOrg
            handleCancel={handleCancel}
            closePopup={handleOk}
          />
        );
      case MODAL.PROJECT:
        return (
          <CreateProject
            handleCancel={handleCancel}
            closePopup={handleOk}
          />
        );
      case MODAL.REPOS:
        return (
          <CreateRepos
            handleCancel={handleCancel}
            closePopup={handleOk}
          />
        );
      default:
        return null;
    }
  }, [modal]);

  const menu = (
    <Menu>
      {data.map(({ title, mode, isDisabled }) => {
        const onClick = () => showModal(mode);
        return (
          <Menu.Item key={`menu-item-${title}`}>
            <Button
              disabled={isDisabled}
              type="link"
              onClick={onClick}
              className={styles.button}
            >
              {title}
            </Button>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <div className={styles.dropdown}>
      <ModalView />
      <div className={styles.wrapper}>
        {' '}
        <Dropdown
          overlay={menu}
          placement="bottomCenter"
          trigger={['click']}
          overlayClassName={styles.dropdown}
          overlayStyle={{ position: 'fixed' }}
        >
          <Button className={styles.addButton}>
            Add
          </Button>
        </Dropdown>

      </div>
    </div>
  );
}

export default AddButton;
