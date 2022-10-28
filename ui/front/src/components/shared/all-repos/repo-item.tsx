import {
  ArgumentTypes, MemberList, RepoType
} from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import forkImg from '@assets/img/fork.svg';
import shareImg from '@assets/img/share.svg';
import starImg from '@assets/img/star.svg';
import dotsImg from '@assets/img/dots.svg';
import {
  AddUserOrg, Excretion, repoData, REPO_PERMISSION
} from '@components/shared';
import { actualTime, clipString, dateCreator } from '@libs/utils';
import React, {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { SyncOutlined } from '@ant-design/icons';
import { useCallApi } from '@libs/hooks/shared';
import { RC } from '@libs/action-creators';
import { useEntitiesAction } from '@libs/hooks/thunk';
import styles from './list-item.module.scss';
import PendingIndicator from './pending-indicator';
import { useRepoItem } from './useRepoItem';
import { Popup } from '../popup';

const iteractionItems = [
  {
    alt: 'fork',
    src: forkImg
  },
  {
    alt: 'share',
    src: shareImg
  },
  {
    alt: 'star',
    src: starImg
  }
];

type ListItemProps = {
  item: RepoType;
  path: string;
  searchText: string;
  deleteRepo: (repo_id: number) => void;
};

function RepoItem({
  item, path, searchText, deleteRepo
}:ListItemProps) {
  const {
    repo_id, repo_name, project_name, organization_name
  } = item;

  const {
    pkey,
    meta,
    repoLink
  } = useRepoItem(item);

  const [visible, setVisible] = useState(false);

  const [callApi] = useCallApi();

  const [permission, setPermisstion] = useState<boolean[] | null>(null);

  const { addRepoMember } = useEntitiesAction();

  const { commit, masterBranch, loading } = meta;

  // const getPermissionForRepo = useCallback(async () => {
  //   const repoMembers = await callApi<MemberList>(
  //     RC.listRepoMembers(repo_name, project_name, organization_name)
  //   );
  //   if (repoMembers) {
  //     const yourPkey = repoMembers.members.find((el) => pkey === el.member);
  //     if (yourPkey) {
  //       setPermisstion(yourPkey.permissions.toString(2).split('').map((el) => !!+el));
  //     }
  //   }
  // }, [repo_name]);

  const handleCloneRepo = () => navigator.clipboard.writeText(repoLink);

  const handleDeleteRepo = () => deleteRepo(repo_id);

  const handleCreateVisible = useCallback((value: boolean) => () => setVisible(value), []);

  const iteractionRender = iteractionItems.map(({ alt, src }) => (
    <div key={`list-item-${alt}`}>
      <img className={styles.dots} alt={alt} src={src} />
      <span>10</span>
    </div>
  ));

  const onClick = ({ key }: { key:string }) => {
    if (key !== 'null') message.info(key);
  };

  const link = `${path}repo/${repo_id}&${repo_name}/branch/tree/${
    masterBranch ? clipString(masterBranch.name) : ''
  }`;

  const canAddMember = () => {
    if (permission) {
      return permission[REPO_PERMISSION.ADD_MEMBER];
    } return null;
  };

  useEffect(() => {
    // getPermissionForRepo();
  }, [item]);

  const menuRender = (
    <Menu onClick={onClick}>
      {pkey && (
        <Menu.Item onClick={handleDeleteRepo} key="Unable to delete">
          Delete repo
        </Menu.Item>
      )}
      <Menu.Item onClick={handleCloneRepo} key={`${repoLink} copied to clipboard!`}>
        Clone Repo
      </Menu.Item>
      {canAddMember() && (
        <Menu.Item
          key={null}
          onClick={handleCreateVisible(true)}
        >
          Add Member
        </Menu.Item>
      ) }
    </Menu>
  );

  const time = useMemo(() => (
    loading
      ? <SyncOutlined spin />
      : commit
        ? `${dateCreator(actualTime(commit))} ago`
        : 'empty'), [commit, loading]);

  const handleRepoLink:React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (!masterBranch) e.preventDefault();
  };

  const handleAddRepoMember = useCallback((obj: ArgumentTypes<typeof addRepoMember>[0]) => {
    addRepoMember({
      ...obj, repo_name, project_name, organization_name
    });
  }, []);

  const titleClassname = commit ? styles.titleWrapper : styles.titleWrapperDisabled;

  const secure = !!item.private && <div className={styles.privateLabel}>Private</div>;

  return (
    <List.Item
      className={styles.listItem}
      key={repo_id}
      actions={[
        <span
          key={item.repo_id}
          className={styles.time}
        >
          {time}
          <PendingIndicator id={item.repo_id} />
        </span>,
        (
          <Dropdown
            key={item.repo_id}
            overlay={menuRender}
            placement="bottomRight"
          >
            <img className={styles.dropdownIcon} alt="dots" src={dotsImg} />
          </Dropdown>
        )
      ]}
    >
      <>
        <Popup onCancel={handleCreateVisible(false)} visible={visible}>
          <AddUserOrg
            data={repoData}
            goBack={handleCreateVisible(false)}
            callback={handleAddRepoMember as (obj: unknown) => void}
          />
        </Popup>
        <List.Item.Meta
          title={(
            <div className={titleClassname}>
              <div className={styles.title}>
                <Link to={link} onClick={handleRepoLink} state={{ id: repo_id }}>
                  <Excretion name={repo_name} inputText={searchText} />
                </Link>
              </div>
              {secure}
            </div>
          )}
          description={(
            <div className={styles.subtitle}>
              <div className={styles.interaction}>
                {iteractionRender}
              </div>
            </div>
          )}
        />
      </>
    </List.Item>
  );
}

export default RepoItem;
