import { Member, MemberId } from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import dotsImg from '@assets/img/dots.svg';
import { Excretion } from '@components/shared';
import { textEllipsis } from '@libs/utils';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { useCallApi } from '@libs/hooks/shared';
import { RC } from '@libs/action-creators';
import { useSelector } from '@libs/redux';
import { AVATAR_COLORS } from '@libs/constants';
import styles from './project-list.module.scss';
import IpfsAvatar from '../ipfs-avatar/ipfs-avatar';

type ListItemProps = {
  item: MemberId;
  path: string;
  searchText: string;
};

function MemberListItem({
  item, path, searchText
}:ListItemProps) {
  const pkey = useSelector((state) => state.app.pkey);
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

  const menuRender = (
    <Menu onClick={onClick} />
  );

  const status = useMemo(() => (pkey === item.member ? 'creator' : 'member'), []);

  const image = useMemo(() => itemData && (
    <IpfsAvatar
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
              <Excretion name={itemData ? itemData.user_name : ''} inputText={searchText} />
            </Link>
          </div>
        )}
        description={<span className={styles.memberDescription}>{status}</span>}
      />
    </List.Item>
  );
}

export default MemberListItem;
