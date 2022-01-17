import {
  BranchCommit, TreeOid, UpdateProps
} from '@types';
import { Select, Typography } from 'antd';
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
    <div style={
      {
        display: 'flex'
      }
    }
    >
      <Typography.Title
        style={{ paddingRight: '5px' }}
        level={5}
      >
        commits

      </Typography.Title>
      <div>
        <Select
          value={value}
          size="small"
          style={{ width: 200 }}
          onChange={onChangeHandler}
        >
          {keys.map(selectOptionMap)}
        </Select>
      </div>
    </div> // TODO: make shared <select> component
  );
};

export default CommitsSelect;
