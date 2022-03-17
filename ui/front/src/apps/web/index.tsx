import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import '@styles/main.scss';
import { BrowserRouter } from 'react-router-dom';
import store from '@libs/redux/store';
import { App } from './components';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.querySelector('#root')
);
