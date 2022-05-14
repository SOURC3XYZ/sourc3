import {
  BeamButton, Nav, Search
} from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { RepoId, RepoListType, RepoType } from '@types';
import { useMemo } from 'react';
import { connect } from 'react-redux';
import { Modal, Input } from 'antd';
import { useAllRepos } from '@libs/hooks/container/all-repos';
import styles from './all-repos.module.scss';
import { RepoList } from './content';

type AllReposProps = {
  pkey:string,
  repos: RepoType[],
  searchText: string,
  createRepos: (repo_name:string) => void,
  deleteRepos: (repo_id: RepoId) => void,
  setInputText: (inputText: string) => void,
  setPrevHref: (href: string) => void
};

function AllRepos({
  pkey,
  repos,
  searchText,
  createRepos,
  deleteRepos,
  setInputText,
  setPrevHref
}:AllReposProps) {
  const talonProps = useAllRepos({
    pkey,
    repos,
    searchText,
    setPrevHref,
    createRepos
  });

  const {
    state,
    repoListProps,
    isModalVisible,
    inputRepoName,
    showModal,
    handleOk,
    handleCancel,
    handleChange
  } = talonProps;

  const { type, path } = repoListProps;

  const repoManager = useMemo(() => (
    <div className={styles.repoHeader}>

      {pkey && <Nav type={type} path={path} />}

      <div className={styles.manage}>
        <div className={styles.searchWrapper}>
          <Search
            text={searchText}
            setInputText={setInputText}
            placeholder="Search by repo name or ID"
          />
        </div>
        {pkey && (
          <div className={styles.buttonWrapper}>
            <BeamButton callback={showModal}>
              Add new
            </BeamButton>
          </div>
        )}
      </div>

      <Modal
        visible={isModalVisible}
        onCancel={handleCancel}
        closable={false}
        footer={[
          <BeamButton callback={handleOk}>
            Add
          </BeamButton>
        ]}
      >
        <Input
          placeholder="Enter name repository"
          value={inputRepoName}
          onChange={handleChange}
          onPressEnter={handleOk}
        />
      </Modal>
    </div>
  ), [searchText, state, pkey]);

  return (
    <div className={styles.content}>
      {repoManager}
      <RepoList
        {...repoListProps}
        searchText={searchText}
        deleteRepos={deleteRepos}
      />
    </div>
  );
}

const mapState = ({
  app: { isApiConnected, pkey },
  entities: { repos, searchText }
}: RootState) => ({
  pkey,
  isApiConnected,
  repos,
  searchText
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getAllRepos: (type: RepoListType) => (resolve: () => void) => {
    dispatch(thunks.getAllRepos(type, resolve));
  },
  createRepos: (repo_name:string) => {
    if (repo_name === null) return;
    dispatch(thunks.createRepos(repo_name));
  },
  deleteRepos: (repo_id: number) => {
    dispatch(thunks.deleteRepos(repo_id));
  },
  setInputText: (inputText: string) => {
    dispatch(AC.setSearch(inputText));
  },
  setPrevHref: (href: string) => {
    dispatch(AC.setPreviousReposPage(href));
  }
});

export default connect(mapState, mapDispatch)(AllRepos);
