import { Member, MemberId } from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import dotsImg from '@assets/img/dots.svg';
import { Excretion } from '@components/shared';
import { textEllipsis } from '@libs/utils';
import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useCallApi, useUpload } from '@libs/hooks/shared';
import { RC } from '@libs/action-creators';
import styles from './project-list.module.scss';

type ListItemProps = {
  item: MemberId;
  path: string;
  searchText: string;
};

function MemberListItem({
  item, path, searchText
}:ListItemProps) {
  const [callApi] = useCallApi();
  const [itemData, setItemData] = useState <Member | null>(null);
  const [src, setSrc] = useState<string | undefined>(undefined);

  const { getImgUrlFromIpfs } = useUpload();

  const getItemData = useCallback(async () => {
    const recievedItem = await callApi<Member>(RC.getUser(item.member));
    if (recievedItem) setItemData(recievedItem);
  }, []);

  const handleLoadPic = useCallback(async () => {
    if (itemData?.user_avatar_ipfs_hash) {
      const link = await getImgUrlFromIpfs(itemData.user_avatar_ipfs_hash);
      if (link) setSrc(link);
    }
  }, [itemData]);

  useEffect(() => {
    getItemData();
  }, []);

  useEffect(() => {
    handleLoadPic();
  }, [itemData]);

  const onClick = ({ key }: { key:string }) => {
    message.info(key);
  };

  const link = `${path}project/${item.member}/1`;

  const menuRender = (
    <Menu onClick={onClick} />
  );

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
        avatar={(
          <img
            className={classNames(styles.memberPicture, {
              [styles.memberPictureActive]: !!src
            })}
            src={src}
            alt="avatar"
          />
        )}
        title={(
          <div className={styles.title}>
            <Link to={link} state={{ id: item.member }}>
              <Excretion name={itemData ? itemData.user_name : ''} inputText={searchText} />
            </Link>
          </div>
        )}
        description={<span className={styles.memberDescription}>member</span>}
      />
    </List.Item>
  );
}

export default MemberListItem;
