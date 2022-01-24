import { SeedList } from '@components/shared';
import { Button } from 'antd';
import styles from './seed-restore.module.css';

type SeedRestoreProps = {
  seed: (string | null)[];
  errors: boolean[];
  validate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  next: () => void;
};

const SeedRestore = ({
  seed, errors, validate, next
}:SeedRestoreProps) => (
  <div className={styles.wrapper}>
    <p className={styles.description}>
      To start using PIT you need to first create an account.
      Each account is uniquely identified by a 12 word mnemonic
      phrase that is secret and should not be revealed to anyone.
      Make at least 2 copies of the phrase in case of emergency
    </p>
    <SeedList
      data={seed}
      errors={errors}
      onInput={validate}
    />
    <div className={styles.btnNav}>
      <Button onClick={next} style={{ borderRadius: 7, margin: '0 auto' }}>
        Complete verification
      </Button>
    </div>
  </div>
);

export default SeedRestore;
