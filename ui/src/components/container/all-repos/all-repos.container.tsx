import { ListRender } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { RepoId, RepoType } from '@types';
import React, { useState, ChangeEvent } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Input } from 'antd';

type AllReposProps = {
  repos: RepoType[],
  getAllRepos: () => void,
  createRepos: (repo_name:string) => void,
  deleteRepos: (repo_id: RepoId) => void
  // resp_name: string
};

const AllRepos = ({
  repos, getAllRepos, createRepos, deleteRepos
}:AllReposProps) => {
  React.useEffect(() => {
    getAllRepos();
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputRepoName, setInputRepoName] = useState('');

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
      <Button onClick={showModal}>New Repository</Button>
      <Modal
        title="Basic Modal"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          placeholder="Enter name repository"
          value={inputRepoName}
          onChange={handleChange}
          onPressEnter={handleOk}
        />
      </Modal>
      <ListRender deleteRepos={deleteRepos} elements={repos} />
    </>
  );
};

const mapState = ({ app: { isConnected, repos } }: RootState) => ({
  isConnected,
  repos
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getAllRepos: () => {
    dispatch(thunks.getAllRepos());
  },
  createRepos: (repo_name:string) => {
    if (repo_name === null) return;
    dispatch(thunks.createRepos(repo_name));
  },
  deleteRepos: (repo_id: number) => {
    dispatch(thunks.deleteRepos(repo_id));
  }
});

export default connect(mapState, mapDispatch)(AllRepos);
