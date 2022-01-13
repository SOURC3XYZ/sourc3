import {
  BeamButton, ListRender, Nav, Search
} from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { RepoId, RepoListType, RepoType } from '@types';
import React, { useState, ChangeEvent } from 'react';
import { connect } from 'react-redux';
import {
  Modal, Input, Row, Col
} from 'antd';
import { useParams } from 'react-router-dom';
import { loadingData, searchFilter } from '@libs/utils';
import styles from './all-repos.module.css';

type LocationState = {
  page: string,
  type: RepoListType
};

type AllReposProps = {
  repos: RepoType[],
  searchText: string,
  getAllRepos: (type: RepoListType) => (resolve: () => void) => void,
  createRepos: (repo_name:string) => void,
  deleteRepos: (repo_id: RepoId) => void,
  setInputText: (inputText: string) => void
};

const AllRepos = ({
  repos, searchText, getAllRepos, createRepos, deleteRepos, setInputText
}:AllReposProps) => {
  const { type, page } = useParams<'type' & 'page'>() as LocationState;
  const [isLoading, setIsLoadin] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputRepoName, setInputRepoName] = useState('');

  const filteredRepos = React.useMemo(() => searchFilter(
    searchText, repos, ['repo_id', 'repo_name']
  ), [searchText, repos]);

  React.useEffect(() => {
    loadingData(getAllRepos(type))
      .then(() => setIsLoadin(false));
  }, [type]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    createRepos(inputRepoName);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputRepoName(e.target.value);
  };

  return (
    <>
      <Nav type={type} />
      <Row className={styles.repoHeader}>
        <Col span={8}>
          <BeamButton title="New" callback={showModal} />
        </Col>
        <Col span={8} offset={8}>
          <Search text={searchText} setInputText={setInputText} />
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
      <ListRender
        searchText={searchText}
        loading={isLoading}
        page={+page}
        deleteRepos={deleteRepos}
        elements={filteredRepos}
        type={type}
      />
    </>
  );
};

const mapState = ({
  app: { isConnected },
  repos: { repos, searchText }
}: RootState) => ({
  isConnected,
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
  }
});

export default connect(mapState, mapDispatch)(AllRepos);
