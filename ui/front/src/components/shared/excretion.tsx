import { equalKeyIndex } from '@libs/utils';
import { Typography } from 'antd';

type ExcretionProps = {
  name: string;
  inputText: string;
};

function Excretion({ name, inputText }:ExcretionProps) {
  const countryIndex = equalKeyIndex(name, inputText);
  return (countryIndex !== -1 ? (
    <>
      {name.slice(0, countryIndex)}
      <Typography.Text mark>
        {name.slice(countryIndex, countryIndex + inputText.length)}
      </Typography.Text>
      {name.slice(countryIndex + inputText.length)}
    </>
  ) : (
    <span>{name}</span>
  )
  );
}

export default Excretion;
