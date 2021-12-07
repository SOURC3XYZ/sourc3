import { combineReducers } from 'redux';
import app from './app.reducer';
import repo from './repo.reducer';

export default combineReducers({ app, repo });
