import { RepoType } from '@types';
import { Link } from 'react-router-dom';
import { Excretion } from '@components/shared';
import styles from './search.module.scss';

type OptionProps = {
  repo: RepoType,
  searchText: string;
};

function Options({ repo, searchText }:OptionProps) {
  const { repo_id, repo_name } = repo;

  const link = `repo/${repo_id}&${repo_name}/tree/`;

  return (
    <Link className={styles.label} to={link} state={{ id: repo_id }}>
      <div className={styles.tableName}>
        <Excretion name={repo_name} inputText={searchText} />
      </div>
      <div className={styles.tableId}>
        <span>id: </span>
        <Excretion name={String(repo_id)} inputText={searchText} />
      </div>
    </Link>
  );
}

export default Options;
