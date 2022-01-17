import { logger } from '@libs/utils';
import {
  BranchName
} from '@types';
import { Select, Typography } from 'antd';

type BranchSelectProps = {
  keys: BranchName[],
  value: string,
  selectHandler: React.Dispatch<BranchName>
};

const selectOptionMap = (el: BranchName, i:number) => (
  <>
    <Select.Option
      value={el}
      key={i}
    >
      {el.split('refs/heads/')}
    </Select.Option>
  </>
);

const BranchSelect = ({
  keys, value, selectHandler
}:BranchSelectProps) => {
  logger('Branch select', [
    ['map', keys]
  ]);

  return (
    <div style={
      {
        display: 'flex'
      }
    }
    >
      <Typography.Title
        style={
          { paddingRight: '5px' }
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
          onChange={selectHandler}
        >
          { keys.map(selectOptionMap) }
        </Select>
      </div>
    </div>
  );
};

export default BranchSelect;
