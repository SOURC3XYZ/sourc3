import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './app';
import store from './libs/redux/store';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root')
);
