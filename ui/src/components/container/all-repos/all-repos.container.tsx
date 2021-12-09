import { ListRender } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { RepoType } from '@types';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Input } from 'antd';
import {useState} from "react";
import { ChangeEvent } from 'react';

type AllReposProps = {
  repos: RepoType[],
  getAllRepos: () => void,
  createRepos: (repo_name:string) => void,
  repo_name: string
};

const AllRepos = ({
  repos, getAllRepos, createRepos, repo_name
}:AllReposProps) => {
  React.useEffect(() => {
    getAllRepos();
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    createRepos(repo_name)
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    repo_name = e.target.value
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>)=> {
    const repo_name = e.target.value;
  }

  return (
    <>
      <Button onClick={showModal}>New Repository</Button>
      <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Input placeholder="Enter name repository" value={repo_name} onChange={handleChange} onPressEnter={handleOk}/>
      </Modal>
      <ListRender elements={repos} />
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
    if (repo_name == null) return;
    dispatch(thunks.createRepos(repo_name));
  }
});

export default connect(mapState, mapDispatch)(AllRepos);
