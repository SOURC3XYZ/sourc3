import { ListRender } from '@components/shared';
import { RootState, AppThunkDispatch, thunks } from '@libs/redux';
import { RepoType } from '@types';
import React from 'react';
import { connect } from 'react-redux';

type AllReposProps = {
  repos: RepoType[],
  getAllRepos: () => void
};

const AllRepos = ({
  repos, getAllRepos
}:AllReposProps) => {
  React.useEffect(() => {
    getAllRepos();
  }, []);

  return (
    <>
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
  }
});

export default connect(mapState, mapDispatch)(AllRepos);
