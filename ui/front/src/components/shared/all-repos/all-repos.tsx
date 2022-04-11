import {
  BeamButton, Nav, Search
} from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { RepoId, RepoListType, RepoType } from '@types';
import React, { ChangeEvent, useCallback } from 'react';
import { connect } from 'react-redux';
import { Modal, Input } from 'antd';
import { useAllRepos, useObjectState } from '@libs/hooks';
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

const initialState = {
  isLoading: true,
  isModalVisible: false,
  inputRepoName: ''
};

const AllRepos = ({
  pkey,
  repos,
  searchText,
  createRepos,
  deleteRepos,
  setInputText,
  setPrevHref
}:AllReposProps) => {
  const [state, setState] = useObjectState<typeof initialState>(initialState);
  const { isModalVisible, inputRepoName } = state;

  const talonProps = useAllRepos({
    pkey, repos, searchText, setPrevHref
  });

  const { type, path } = talonProps;

  const showModal = () => {
    setState({ isModalVisible: true });
  };

  const handleOk = () => {
    setState({ isModalVisible: false });
    createRepos(inputRepoName);
  };

  const handleCancel = () => {
    setState({ isModalVisible: false });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ inputRepoName: e.target.value });
  };

  const RepoManager = (inputText: string) => (
    <div className={styles.repoHeader}>

      <Nav type={type} path={path} />

      <div className={styles.manage}>
        <div className={styles.searchWrapper}>
          <Search
            text={inputText}
            setInputText={setInputText}
            placeholder="Search by repo name or ID"
          />
        </div>
        <div className={styles.buttonWrapper}>
          <BeamButton callback={showModal}>
            Add new
          </BeamButton>
        </div>
      </div>

      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
      >
        <Input
          placeholder="Enter name repository"
          value={inputRepoName}
          onChange={handleChange}
          onPressEnter={handleOk}
        />
      </Modal>
    </div>
  );

  const RepoManagerView = useCallback((props:{ text:string }) => (
    <>
      {pkey && RepoManager(props.text)}
    </>
  ), [pkey, state]);

  return (
    <div className={styles.content}>
      <RepoManagerView text={searchText} />
      <RepoList
        {...talonProps}
        searchText={searchText}
        deleteRepos={deleteRepos}
      />
    </div>
  );
};

const mapState = ({
  app: { isApiConnected, pkey },
  repos: { repos, searchText }
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
