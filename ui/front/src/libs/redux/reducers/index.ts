import { combineReducers } from 'redux';
import app from './user.reducer';
import repo from './repo.reducer';
import entities from './entities.reducer';
import wallet from './wallet.reducer';
import profile from './profiles.reducer';
import sourc3Profile from './sourc3Profile';

export default combineReducers({
  app, repo, entities, wallet, profile, sourc3Profile
});
