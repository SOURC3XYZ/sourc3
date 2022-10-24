import { Organization, OwnerListType } from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import dotsImg from '@assets/img/dots.svg';
import { Excretion, IpfsAvatars } from '@components/shared';
import { textEllipsis } from '@libs/utils';
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
  const { organization_name, organization_creator, organization_logo_ipfs_hash } = item;

  const onClick = ({ key }: { key:string }) => {
    message.info(key);
  };

  const link = `${path}organizations-list/${organization_name}/projects?type=${type}&page=1`;

  const menuRender = (
    <Menu onClick={onClick} />
  );

  return (
    <List.Item
      className={styles.listItem}
      key={organization_name}
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
        avatar={(
          <IpfsAvatars
            ipfs={organization_logo_ipfs_hash}
            colors={AVATAR_COLORS}
            name={`${organization_name}${organization_creator}`}
            size={56}
            variant="ring"
          />
        )}
        title={(
          <div className={styles.title}>
            <Link to={link} state={{ id: organization_name }}>
              <Excretion name={organization_name} inputText={searchText} />
            </Link>
          </div>
        )}
        description={(
          <div className={styles.subtitle}>
            <div className={styles.idField}>
              <span>ID: </span>
              <Excretion
                name={String(organization_name)}
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
