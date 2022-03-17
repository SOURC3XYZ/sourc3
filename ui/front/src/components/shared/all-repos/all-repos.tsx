import {
  BeamButton, Nav, Search
} from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { RepoId, RepoListType, RepoType } from '@types';
import React, { ChangeEvent, useCallback } from 'react';
import { connect } from 'react-redux';
import {
  Modal, Input, Row, Col
} from 'antd';
import { useLocation, useParams } from 'react-router-dom';
import { loadingData, searchFilter } from '@libs/utils';
import { useObjectState } from '@libs/hooks';
import styles from './all-repos.module.css';
import { RepoList } from './content';

type LocationState = {
  page: string,
  type: RepoListType
};

type AllReposProps = {
  pkey:string,
  repos: RepoType[],
  searchText: string,
  getAllRepos: (type: RepoListType) => (resolve: () => void) => void,
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
  getAllRepos,
  createRepos,
  deleteRepos,
  setInputText,
  setPrevHref
}:AllReposProps) => {
  const location = useLocation();
  const { pathname } = location;
  const { type, page } = useParams<'type' & 'page'>() as LocationState;
  const [state, setState] = useObjectState<typeof initialState>(initialState);
  const { isLoading, isModalVisible, inputRepoName } = state;
  const path = pathname.split('repos/')[0];

  const filteredRepos = React.useMemo(() => searchFilter(
    searchText, repos, ['repo_id', 'repo_name']
  ), [searchText, repos]);

  React.useEffect(() => {
    loadingData(getAllRepos(type))
      .then(() => setState({ isLoading: false }));
  }, [type]);

  React.useEffect(() => {
    setPrevHref(pathname);
  }, [page]);

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
    <>
      <Nav type={type} path={path} />
      <Row className={styles.repoHeader}>
        <Col span={8}>
          <BeamButton title="New" callback={showModal} />
        </Col>
        <Col span={8} offset={8}>
          <Search
            text={inputText}
            setInputText={setInputText}
            placeholder="type something"
          />
        </Col>
      </Row>

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
    </>
  );

  const RepoManagerView = useCallback((props:{ text:string }) => (
    <>
      {Boolean(pkey) && RepoManager(props.text)}
    </>
  ), [pkey, state]);

  return (
    <div className={styles.content}>
      <RepoManagerView text={searchText} />
      <RepoList
        path={path}
        searchText={searchText}
        loading={isLoading}
        page={+page}
        deleteRepos={deleteRepos}
        elements={filteredRepos}
        type={type}
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
