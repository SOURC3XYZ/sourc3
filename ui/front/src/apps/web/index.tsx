import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import '@styles/main.scss';
import './index.scss';
import { BrowserRouter } from 'react-router-dom';
import store from '@libs/redux/store';
import { BeamWebApi } from '@components/context';
import { MetaMaskProvider } from 'metamask-react';
import { Sourc3WSProvider } from '@components/context/websocket-ctx';
import { App } from './components';

const container = document.querySelector('#root') as NonNullable<HTMLElement>;

ReactDOM.render(
  <BrowserRouter>
    <Sourc3WSProvider>
      <BeamWebApi>
        <MetaMaskProvider>
          <Provider store={store}>
            <App />
          </Provider>
        </MetaMaskProvider>
      </BeamWebApi>
    </Sourc3WSProvider>
  </BrowserRouter>,
  container
);
