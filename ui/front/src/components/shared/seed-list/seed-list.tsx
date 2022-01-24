import styles from './seed-list.module.css';

interface SeedListProps {
  data: (string | null)[];
  errors: boolean[];
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SeedList = ({ data, errors, onInput }:SeedListProps) => {
  const handlePaste = () => {};

  const validatedSeedWord = (el: string | null, i:number) => {
    const className = !el ? '' : errors[i]
      ? styles.validName : styles.errorName;
    return (
      <li className={className} key={i} data-index={i + 1}>
        <input
          required
          value={el ?? ''}
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
