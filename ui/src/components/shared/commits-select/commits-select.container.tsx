import {
  BranchCommit, TreeOid, UpdateProps
} from '@types';
import { Select } from 'antd';
import React from 'react';

const selectOptionMap = (el: BranchCommit) => (
  <Select.Option
    value={el.tree_oid}
    key={el.tree_oid}
  >
    {el.raw_message}
  </Select.Option>
);

type CommitSelectProps = {
  keys: BranchCommit[];
  value: TreeOid;
  updateTree: (props: Omit<UpdateProps, 'id'>) => void;
};

const CommitsSelect = ({
  keys, value, updateTree
}:CommitSelectProps) => {
  const onChangeHandler = (oid: TreeOid) => {
    updateTree({ oid });
  };

  React.useEffect(() => {
    updateTree({ oid: value });
  }, [value, keys]);

  return (
    <>
      <Select
        value={value}
        size="small"
        style={{ width: 200 }}
        onChange={onChangeHandler}
      >
        {keys.map(selectOptionMap)}
      </Select>

    </>
  );
};

export default CommitsSelect;
