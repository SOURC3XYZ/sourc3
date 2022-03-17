import store from '@libs/redux/store';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import './index.css';
import { App } from './components';

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.querySelector('#root')
);
