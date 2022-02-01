import {
  BranchName
} from '@types';
import { Select, Typography } from 'antd';

type BranchSelectProps = {
  keys: BranchName[],
  value: string,
  commit: string,
  onChange: (selectedCommit: string, selectedBranch?: string) => void
};

const selectOptionMap = (el: BranchName, i:number) => (
  <>
    <Select.Option
      value={el}
      key={i}
    >
      {el}
    </Select.Option>
  </>
);

const BranchSelect = ({
  keys, value, commit, onChange
}:BranchSelectProps) => {
  const onChangeDecor = (branch: string) => onChange(commit, branch);

  return (
    <div style={
      {
        display: 'flex'
      }
    }
    >
      <Typography.Title
        style={
          { paddingRight: '5px' } // TODO: Put in css file
        }
        level={5}
      >
        branch

      </Typography.Title>
      <div>
        <Select
          defaultValue={keys[keys.length - 1]}
          size="small"
          value={value}
          style={{ width: 200 }}
          onChange={onChangeDecor}
        >
          { keys.map(selectOptionMap) }
        </Select>
      </div>
    </div>
  );
};

export default BranchSelect;
