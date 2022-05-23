import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import '@styles/main.scss';
import './index.scss';
import { BrowserRouter } from 'react-router-dom';
import store from '@libs/redux/store';
import { BeamWebApi } from '@components/context';
import { App } from './components';

const container = document.querySelector('#root') as NonNullable<HTMLElement>;

ReactDOM.render(
  <BeamWebApi>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </BeamWebApi>,
  container
);
