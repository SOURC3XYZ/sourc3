import { combineReducers } from 'redux';
import app from './app.reducer';
import repo from './repo.reducer';
import repos from './repos.reducer';
import wallet from './wallet.reducer';

export default combineReducers({
  app, repo, repos, wallet
});
