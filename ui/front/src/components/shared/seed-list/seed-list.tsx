import { shuffle } from '@libs/utils';
import React from 'react';
import styles from './seed-list.module.scss';

interface SeedListProps {
  data: (string | null) [];
  errors: boolean[];
  readOnly?:boolean;
  isShuffle?: boolean;
  isSlice?: boolean;
  listGenerated?: boolean;
  listConfirm?: boolean;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validatePasted?: (e: React.ClipboardEvent<HTMLDivElement>) => void
  next: () => void
}

function SeedList({
  data, errors, isShuffle, isSlice, listGenerated, listConfirm,
  readOnly, onInput, validatePasted, next
}:SeedListProps) {
  const shuffleIndexes = React.useMemo(() => shuffle(data), []);
  const validatedSeedWord = (el: string | null, i:number) => {
    if (el === null) return el;
    const className = !el ? '' : errors[i]
      ? styles.validName : styles.errorName;
    return (
      <li className={className} key={i} data-index={i + 1}>
        <input
          readOnly={readOnly}
          required
          autoFocus={i === 0}
          value={el ?? ''}
          data-index={i}
          type="text"
          onInput={onInput}
          onKeyDown={(e) => (e.key === 'Enter' && next())}
        />
      </li>
    );
  };

  const visualisation = (datalist: (string | null) []) => {
    const list = datalist
      .map(validatedSeedWord)
      .filter((el) => el);
    if (isShuffle) {
      const shuffled = shuffleIndexes
        .map((el) => list[el]);
      if (isSlice) {
        return shuffled.slice(6);
      }
      return shuffled;
    }
    return list;
  };

  const classNameList = listGenerated
    ? styles.listGenerated : listConfirm ? styles.listConfirm : styles.list;

  return (
    <div className={classNameList} onPaste={validatePasted}>
      {visualisation(data)}
    </div>
  );
}

export default SeedList;
