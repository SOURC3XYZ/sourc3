import { shuffle } from '@libs/utils';
import React from 'react';
import styles from './seed-list.module.css';

interface SeedListProps {
  data: (string | null) [];
  errors: boolean[];
  isShuffle?: boolean;
  isSlice?: boolean;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validatePasted?: (e: React.ClipboardEvent<HTMLDivElement>) => void
}

const SeedList = ({
  data, errors, isShuffle, isSlice, onInput, validatePasted
}:SeedListProps) => {
  const shuffleIndexes = React.useMemo(() => shuffle(data), []);

  const validatedSeedWord = (el: string | null, i:number) => {
    if (el === null) return el;
    const className = !el ? '' : errors[i]
      ? styles.validName : styles.errorName;
    return (
      <li className={className} key={i} data-index={i + 1}>
        <input
          required
          value={el ?? ''}
          data-index={i}
          type="text"
          onInput={onInput}
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

  return (
    <div className={styles.list} onPaste={validatePasted}>
      {visualisation(data)}
    </div>
  );
};

export default SeedList;
