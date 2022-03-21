import {
  BranchCommit, TreeOid
} from '@types';
import { Select } from 'antd';
import styles from './commits-select.module.scss';

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
    <div className={styles.branchSelect}>
      <span className={styles.title}>
        Commits

      </span>
      <div>
        <Select
          bordered={false}
          value={value}
          size="small"
          onChange={onChangeDecor}
        >
          {keys.map(selectOptionMap)}
        </Select>
      </div>
    </div> // TODO: make shared <select> component
  );
};

export default CommitsSelect;
