import { OwnerListType, Project } from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import dotsImg from '@assets/img/dots.svg';
import { Excretion, IpfsAvatars } from '@components/shared';
import { textEllipsis } from '@libs/utils';
import { AVATAR_COLORS } from '@libs/constants';
import styles from '../project-list.module.scss';

type ListItemProps = {
  item: Project;
  path: string;
  searchText: string;
  type: OwnerListType;
};

export function ProjectListItem({
  item, path, searchText, type
}:ListItemProps) {
  const {
    organization_name, project_creator, project_name
  } = item;

  const onClick = ({ key }: { key:string }) => {
    message.info(key);
  };

  const link = `${path}project/${project_name}/repos?type=${type}&page=1`;

  const menuRender = (
    <Menu onClick={onClick} />
  );

  const content = (
    item.project_description && (
      <div className={styles.content}>
        {item.project_description}
      </div>
    )
  );

  return (
    <List.Item
      className={styles.listItem}
      key={organization_name}
      actions={[(
        <span key="org-times" className={styles.time}>
          {`creator: ${textEllipsis(project_creator, 10)}`}
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
            ipfs={item.project_logo_ipfs_hash}
            colors={AVATAR_COLORS}
            name={`${project_name}${item.project_name}${item.project_creator}`}
            size={56}
            variant="pixel"
            square
          />
        )}
        title={(
          <div className={styles.title}>
            <Link to={link} state={{ id: organization_name }}>
              <Excretion name={project_name} inputText={searchText} />
            </Link>
          </div>
        )}
        description={(
          <div className={styles.subtitle}>
            {content}
          </div>
        )}
      />
    </List.Item>
  );
}
