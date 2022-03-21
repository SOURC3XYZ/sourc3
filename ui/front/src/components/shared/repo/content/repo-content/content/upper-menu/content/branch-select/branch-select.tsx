import {
  BranchName
} from '@types';
import { Select } from 'antd';
import styles from './branch-select.module.scss';

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
    <div className={styles.branchSelect}>
      <span className={styles.title}>
        Branch
      </span>
      <div>
        <Select
          bordered={false}
          defaultValue={keys[keys.length - 1]}
          size="small"
          value={value}
          onChange={onChangeDecor}
        >
          { keys.map(selectOptionMap) }
        </Select>
      </div>
    </div>
  );
};

export default BranchSelect;
