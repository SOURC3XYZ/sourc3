import { SyncOutlined } from '@ant-design/icons';
import { FormWrapper, IpfsAvatars } from '@components/shared';
import { RC } from '@libs/action-creators';
import { AVATAR_COLORS } from '@libs/constants';
import { useCallApi, useDebounce } from '@libs/hooks/shared';
import { getSetValueByIndex, textEllipsis } from '@libs/utils';
import { Member } from '@types';
import {
  Checkbox, Col, Input, Row, Typography
} from 'antd';
import React, {
  ChangeEvent, useCallback, useMemo, useState
} from 'react';

type AddUserProps<T> = {
  id: number;
  data: Set<string>
  goBack: () => void;
  callback: (obj: T) => void;
};
function AddUser<T>(
  {
    id, data, goBack, callback
  }:AddUserProps<T>
) {
  const [bitMask, setBitMask] = useState<(0 | 1)[]>(Array.from(data).map(() => 0));
  const [callApi] = useCallApi();
  const [userInfo, setUser] = useState<Member | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleChange = useCallback((i:number) => {
    setBitMask((prev) => {
      const newBitMask = [...prev];
      newBitMask[i] = +!prev[i] as 0 | 1;
      return newBitMask;
    });
  }, [bitMask]);

  const isDisabled = useMemo(() => !bitMask.some((el) => el)
    || isLoading || !userInfo, [bitMask, isLoading, userInfo]);

  const handleOk = useCallback(() => {
    if (userInfo) {
      const bitMaskCopy = [...bitMask];
      const binary = bitMaskCopy.reverse().join('');
      const permissions = parseInt(binary, 2);
      const toSend = {
        id,
        permissions,
        member: userInfo?.user_id
      } as T;
      callback(toSend);
    }
  }, [bitMask]);

  const updateUser = async (e:ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.value) {
      setLoading(false);
      setUser(null);
      return;
    }
    const user = await callApi<Member>(RC.getUser(e.target.value));
    if (user) setUser(user);
    setLoading(false);
  };

  const debounce = useDebounce<
  [ChangeEvent<HTMLInputElement>]>((e: ChangeEvent<HTMLInputElement>) => {
    updateUser(e);
  }, 1000);

  const handleUpdateUser = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isLoading || userInfo) {
      setUser(null);
      setLoading(true);
    }
    debounce(e);
  };

  const userProfile = useMemo(() => {
    if (!userInfo) {
      if (isLoading) return <SyncOutlined spin />;
      return null;
    }
    const name = userInfo.user_name || textEllipsis(userInfo.user_id, 8, { ellipsis: '' });
    return (
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <IpfsAvatars
          colors={AVATAR_COLORS}
          name={userInfo.user_id}
          size={30}
          ipfs={userInfo.user_avatar_ipfs_hash}
          variant="beam"
        />
        <Typography.Text>
          {name}
        </Typography.Text>
      </div>
    );
  }, [userInfo, isLoading]);

  const checkBoxes = useMemo(() => bitMask.map((el, i) => {
    const disabled = !userInfo || isLoading;
    const title = getSetValueByIndex(data, i);
    return (
      <div key={`${title}`}>
        <Checkbox
          disabled={disabled}
          checked={!!bitMask[i]}
          onChange={() => { handleChange(i); }}
        >
          {title}
        </Checkbox>
      </div>
    );
  }), [bitMask, userInfo, isLoading]);

  return (
    <FormWrapper
      title="Add User"
      isDisabled={isDisabled}
      goBack={goBack}
      handleOk={handleOk}
    >
      <>
        <Row gutter={16}>
          <Col>
            <Input onChange={handleUpdateUser} />
          </Col>
          <Col>
            {userProfile}
          </Col>
        </Row>
        <div>
          <h2>Permissions: </h2>
          {checkBoxes}
        </div>
      </>
    </FormWrapper>
  );
}

export default React.memo(AddUser);
