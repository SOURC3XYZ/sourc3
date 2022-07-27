import store from '@libs/redux/store';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import './index.scss';
import { BeamDesktopApi } from '@components/context';
import { App } from './components';
import '@styles/main.scss';

ReactDOM.render(
  <BeamDesktopApi>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </BeamDesktopApi>,
  document.querySelector('#root')
);
