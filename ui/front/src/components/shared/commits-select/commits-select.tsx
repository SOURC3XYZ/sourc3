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
  // const navigate = useNavigate();

  // const treeUrl = window.location.pathname
  //   .split('/')
  //   .slice(6)
  //   .join('/');

  const onChangeDecor = (commit:string) => onChange(commit);

  // const onChangeHandler = (treeOid: TreeOid) => {
  //   updateTree({ oid: treeOid });
  //   const tree = keys.find((el) => el.tree_oid === treeOid);
  //   if (tree) {
  //     navigate(
  //       `${baseUrl}/${tree.commit_oid}${treeUrl && `/${treeUrl}`}`
  //     );
  //   }
  // };

  // React.useEffect(() => {
  //   updateTree({ oid: value });
  // }, [value, keys]);

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
