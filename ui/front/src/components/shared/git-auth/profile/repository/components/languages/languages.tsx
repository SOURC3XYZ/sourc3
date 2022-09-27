import React, { useEffect, useState } from 'react';
import { Milestone } from '@components/shared/git-auth/profile/repository/components';
import { ILanguages } from '@types';
import styles from './languages.module.scss';

type languagesType = {
  data:[ILanguages]
};
function Languages({ data }:languagesType) {
  const [maxAddLines, setMaxAddLines] = useState(0);

  const persent = (lines:number, add: number, remove:number) => +(((add + remove) / lines) * 100).toFixed(2);

  useEffect(() => {
    setMaxAddLines(data.reduce((currentSum, currentNumber) => (!currentNumber.renamed_files_cnt ? (currentSum + (currentNumber.added_lines_cnt + currentNumber.removed_lines_cnt)) : currentSum), 0));
  }, [data]);
  return (
    <div className={styles.langStone}>
      {data.map((el) => (
        <Milestone
          key={`${Date.now()}_${el.language}`}
          title={el.renamed_files_cnt ? (`Renamed files - ${el.renamed_files_cnt}`) : ((`${el.language}  (${persent(maxAddLines, el.added_lines_cnt, el.removed_lines_cnt)} %)`))}
        />
      ))}

    </div>
  );
}

export default Languages;
