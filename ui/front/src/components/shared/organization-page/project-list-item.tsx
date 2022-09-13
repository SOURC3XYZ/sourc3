import { OwnerListType, Project } from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import dotsImg from '@assets/img/dots.svg';
import { Excretion, IpfsAvatars } from '@components/shared';
import { textEllipsis } from '@libs/utils';
import { AVATAR_COLORS } from '@libs/constants';
import styles from './project-list.module.scss';

type ListItemProps = {
  item: Project;
  path: string;
  searchText: string;
  type: OwnerListType;
};

function ProjectListItem({
  item, path, searchText, type
}:ListItemProps) {
  const {
    organization_id, project_creator, project_name, project_id
  } = item;

  const onClick = ({ key }: { key:string }) => {
    message.info(key);
  };

  const link = `${path}project/${project_id}/1/repos?type=${type}`;

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
      key={organization_id}
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
            colors={AVATAR_COLORS}
            name={`${project_id}${item.project_name}${item.project_creator}`}
            size={56}
            variant="pixel"
            square
          />
        )}
        title={(
          <div className={styles.title}>
            <Link to={link} state={{ id: organization_id }}>
              <Excretion name={project_name} inputText={searchText} />
            </Link>
          </div>
        )}
        description={(
          <div className={styles.subtitle}>
            <div className={styles.idField}>
              <span>ID: </span>
              <Excretion
                name={String(project_id)}
                inputText={searchText}
              />
            </div>
            {content}
          </div>
        )}
      />
    </List.Item>
  );
}

export default ProjectListItem;
