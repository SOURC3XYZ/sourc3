import React, { useEffect, useState } from 'react';
import { Milestone } from '@components/shared/git-auth/profile/repository/components';
import { ILanguages } from '@types';
import styles from './languages.module.scss';

type languagesType = {
  data:[ILanguages]
};
function Languages({ data }:languagesType) {
  const [maxAddLines, setMaxAddLines] = useState(0);

  const calc = (items:[ILanguages]) => {
    setMaxAddLines(items.reduce((acc, course) => (course.language ? acc + (course.added_lines_cnt + course.removed_lines_cnt) : acc), maxAddLines));
  };
  const persent = (lines:number, add: number, remove:number) => +(((add + remove) / lines) * 100).toFixed(2);

  useEffect(() => {
    calc(data);
  }, []);
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
