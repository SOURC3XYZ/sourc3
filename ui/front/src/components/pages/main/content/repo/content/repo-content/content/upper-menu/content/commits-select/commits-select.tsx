import {
  BranchCommit, TreeOid
} from '@types';
import { Select, Typography } from 'antd';
import React from 'react';

const selectOptionMap = (el: BranchCommit) => (
  <Select.Option
    value={el.commit_oid}
    key={el.commit_oid}
  >
    {el.raw_message}
  </Select.Option>
);

type CommitSelectProps = {
  keys: BranchCommit[];
  value: TreeOid;
  onChange: (commit: string) => void;
  // updateTree: (props: Omit<UpdateProps, 'id'>) => void;
};

const CommitsSelect = ({
  keys, value, onChange
}:CommitSelectProps) => {
  const onChangeDecor = (commit:string) => onChange(commit);
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
          onChange={onChangeDecor}
        >
          {keys.map(selectOptionMap)}
        </Select>
      </div>
    </div> // TODO: make shared <select> component
  );
};

export default CommitsSelect;
