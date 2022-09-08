import { combineReducers } from 'redux';
import app from './user.reducer';
import repo from './repo.reducer';
import entities from './entities.reducer';
import wallet from './wallet.reducer';
import profile from './profiles.reducer';

export default combineReducers({
  app, repo, entities, wallet, profile
});
