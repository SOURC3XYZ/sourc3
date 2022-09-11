import { Organization, OwnerListType } from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import dotsImg from '@assets/img/dots.svg';
import { Excretion } from '@components/shared';
import { textEllipsis } from '@libs/utils';
import classNames from 'classnames';
import Avatar from 'boring-avatars';
import { useGetIpfsImage } from '@libs/hooks/shared';
import { AVATAR_COLORS } from '@libs/constants';
import styles from './org-list.module.scss';

type ListItemProps = {
  item: Organization;
  path: string;
  searchText: string;
  type:OwnerListType;
};

function OrgListItem({
  item, path, searchText, type
}:ListItemProps) {
  const src = useGetIpfsImage(item.organization_logo_ipfs_hash);

  const { organization_name, organization_id, organization_creator } = item;

  const onClick = ({ key }: { key:string }) => {
    message.info(key);
  };

  const link = `${path}projects/${organization_id}/1/projects?type=${type}`;

  const menuRender = (
    <Menu onClick={onClick} />
  );

  const image = item.organization_logo_ipfs_hash ? (
    <img
      className={classNames(styles.entityPicture, {
        [styles.entityPictureActive]: !!src
      })}
      src={src ?? undefined}
      alt="avatar"
    />
  )
    : (
      <Avatar
        size="56px"
        square
        variant="sunset"
        name={`${item.organization_id}${item.organization_name}${item.organization_creator}`}
        colors={AVATAR_COLORS}
      />
    ); // TOOD: MAKE SHARED COMPONENT

  return (
    <List.Item
      className={styles.listItem}
      key={organization_id}
      actions={[(
        <span key="org-times" className={styles.time}>
          {`owner: ${textEllipsis(organization_creator, 10)}`}
        </span>
      ),
      (
        <Dropdown key="org-drop" overlay={menuRender} placement="bottomRight">
          <img className={styles.dropdownIcon} alt="dots" src={dotsImg} />
        </Dropdown>
      )
      ]}
    >
      <List.Item.Meta
        avatar={image}
        title={(
          <div className={styles.title}>
            <Link to={link} state={{ id: organization_id }}>
              <Excretion name={organization_name} inputText={searchText} />
            </Link>
          </div>
        )}
        description={(
          <div className={styles.subtitle}>
            <div className={styles.idField}>
              <span>ID: </span>
              <Excretion
                name={String(organization_id)}
                inputText={searchText}
              />
            </div>
          </div>
        )}
      />
    </List.Item>
  );
}

export default OrgListItem;
