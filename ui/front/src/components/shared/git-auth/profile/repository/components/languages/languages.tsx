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

  const newData = data.map((el) => {
    if (el.languages) {
      const a = el.languages.join();
      const sum = persent(maxAddLines, el.added_lines_cnt, el.removed_lines_cnt);
      return { ...el, language: a, sum };
    }
    const sum = persent(maxAddLines, el.added_lines_cnt, el.removed_lines_cnt);
    return { ...el, sum };
  }).sort((a, b) => b.sum - a.sum).filter((items) => items.sum >= 0.5);

  // function renderMilestone(item:ILanguages) {
  //   if (item.renamed_files_cnt) {
  //     return `Renamed files - ${item.renamed_files_cnt}`;
  //   } if (item.language) {
  //     return `${item.language}   (${item.sum} %)`;
  //   }
  // }

  return (
    <div className={styles.langStone}>
      {newData.map((el) => (
        <Milestone
          key={`${window.crypto.randomUUID()}`}
          title={el.renamed_files_cnt ? (`Renamed files - ${el.renamed_files_cnt}`) : el.languages ? (`${el.languages[0]}... `) : ((`${el.language} `))}
          tooltip={el.languages && el.language}
          procent={el.sum}
        />
      ))}

    </div>
  );
}

export default Languages;
