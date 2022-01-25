import { WALLET } from '@libs/constants';
import styles from './seed-list.module.css';

interface SeedListProps {
  data: string [];
  errors: boolean[];
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validatePasted: (str: string[]) => void;
}

const SeedList = ({
  data, errors, onInput, validatePasted
}:SeedListProps) => {
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const seedArr = e.target.value.split(';');
    if (seedArr.length === WALLET.SEED_PHRASE_COUNT) {
      validatePasted(seedArr);
    }
  };

  const validatedSeedWord = (el: string, i:number) => {
    const className = !el ? '' : errors[i]
      ? styles.validName : styles.errorName;
    return (
      <li className={className} key={i} data-index={i + 1}>
        <input
          required
          value={el}
          autoFocus={i === 0}
          data-index={i}
          type="text"
          onInput={onInput}
        />
      </li>
    );
  };

  return (
    <div className={styles.list} onPaste={handlePaste}>
      {data.map(validatedSeedWord)}
    </div>
  );
};

export default SeedList;
