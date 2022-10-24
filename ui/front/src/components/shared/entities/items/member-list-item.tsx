import { Member, MemberId } from '@types';
import {
  Menu, Dropdown, List, message, Tag
} from 'antd';
import { Link } from 'react-router-dom';
import dotsImg from '@assets/img/dots.svg';
import { Excretion, IpfsAvatars } from '@components/shared';
import { getSetValueByIndex, textEllipsis } from '@libs/utils';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { useCallApi } from '@libs/hooks/shared';
import { RC } from '@libs/action-creators';
import { AVATAR_COLORS } from '@libs/constants';
import styles from '../project-list.module.scss';

type ListItemProps = {
  item: MemberId;
  path: string;
  data: Set<string>;
  searchText: string;
};

export function MemberListItem({
  item, path, data, searchText
}:ListItemProps) {
  const parsedPermissions = useMemo(
    () => item.permissions
      .toString(2)
      .split('')
      .map((el) => !!+el),
    [item.permissions]
  );

  const [callApi] = useCallApi();
  const [itemData, setItemData] = useState <Member | null>(null);

  const getItemData = useCallback(async () => {
    const recievedItem = await callApi<Member>(RC.getUser(item.member));
    if (recievedItem) setItemData(recievedItem);
  }, []);

  useEffect(() => {
    getItemData();
  }, []);

  const onClick = ({ key }: { key:string }) => {
    message.info(key);
  };

  const link = `${path}project/${item.member}/1`;

  const handleGetPkey = () => navigator.clipboard.writeText(item.member);

  const menuRender = (
    <Menu onClick={onClick}>
      <Menu.Item onClick={handleGetPkey} key={`${item.member} copied to clipboard!`}>
        Get Pkey
      </Menu.Item>
    </Menu>
  );
  const status = useMemo(() => parsedPermissions.map((el, i) => {
    const title = getSetValueByIndex(data, i);
    if (el) return <Tag color="default" key={`tag-${title}`}>{title}</Tag>;
    return null;
  }).filter((el) => el), [parsedPermissions]);

  const image = useMemo(() => itemData && (
    <IpfsAvatars
      colors={AVATAR_COLORS}
      name={item.member}
      size={56}
      variant="beam"
      ipfs={itemData?.user_avatar_ipfs_hash}
    />
  ), [itemData]);

  return (
    <List.Item
      className={styles.listItem}
      key={item.member}
      actions={[(
        <div key="user-id" className={styles.idField}>
          <span>ID: </span>
          <Excretion
            name={String(textEllipsis(item.member, 6, { ellipsis: '' }))}
            inputText={searchText}
          />
        </div>
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
            <Link to={link} state={{ id: item.member }}>
              <Excretion
                name={
                  itemData?.user_name
                    ? itemData.user_name
                    : textEllipsis(item.member, 7, { ellipsis: '' })
                }
                inputText={searchText}
              />
            </Link>
          </div>
        )}
        description={<div className={styles.memberDescription}>{status}</div>}
      />
    </List.Item>
  );
}
