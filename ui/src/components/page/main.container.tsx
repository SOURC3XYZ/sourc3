import { AppThunkDispatch, RootState, thunks } from '@libs/redux';
import { RepoType } from '@types';
import React from 'react';
import { connect } from 'react-redux';

type MainProps = {
  connectApi: () => void,
  getAllRepos: () => void,
  isConnected: boolean,
  repos: RepoType[]
};

const Main = ({
  isConnected, repos, connectApi, getAllRepos
}:MainProps) => {
  React.useEffect(() => {
    connectApi();
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isConnected && getAllRepos();
  }, [isConnected]);

  return (
    <>
      <div>{isConnected && 'connected'}</div>
      <pre>
        {JSON.stringify(repos, null, '\t')}
      </pre>
    </>
  );
};

const mapState = ({ app: { isConnected, repos } }: RootState) => ({
  isConnected,
  repos
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  connectApi: () => {
    dispatch(thunks.connectBeamApi());
  },
  getAllRepos: () => {
    dispatch(thunks.getAllRepos());
  }
});

export default connect(mapState, mapDispatch)(Main);
