import { logger } from '@libs/utils';
import { RepoCommit } from '@types';
import { Select } from 'antd';

const selectOptionMap = (el: RepoCommit) => (
  <Select.Option
    value={el.raw_message}
    key={el.tree_oid}
  >
    {el.raw_message}
  </Select.Option>
);

type CommitSelectProps = {
  refs: RepoCommit[]
};

const CommitsSelect = ({
  refs
}:CommitSelectProps) => {
  logger('logger', []);
  return (
    <>
      <Select
        size="small"
        style={{ width: 200 }}
      >
        {refs.map(selectOptionMap)}
      </Select>
    </>
  );
};

export default CommitsSelect;
