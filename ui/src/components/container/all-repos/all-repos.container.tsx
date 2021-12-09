import { ListRender } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { RepoType } from '@types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
// import { DownloadOutlined } from 'antd/lib/icons';

type AllReposProps = {
  repos: RepoType[],
  getAllRepos: () => void,
  createRepos: () => void,
  // resp_name: string
};

const AllRepos = ({
  repos, getAllRepos, createRepos
}:AllReposProps) => {
  React.useEffect(() => {
    getAllRepos();
  }, []);
  // const createRepos = (dispatch:AppThunkDispatch):void => {
  //  dispatch(thunks.getAllRepos());
  //   console.log(2);
  // };
  return (
    <>
      <div className="control">
        <Button onClick={createRepos}>New Rep</Button>
      </div>
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
  createRepos: () => {
    const resp_name = prompt('Enter repository name');
    if (resp_name == null) return;
    dispatch(thunks.createRepos(resp_name));
  }
});

export default connect(mapState, mapDispatch)(AllRepos);
