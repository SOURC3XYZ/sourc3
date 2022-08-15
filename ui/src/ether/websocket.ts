import WebSocket from 'ws';
import { getRepoId } from './eth-api';

function onConnect(wsClient:WebSocket) {
  console.log('new user');
  wsClient.send('Hi!');
  wsClient.on('message', (message) => {
    console.log(message.toString());
    try {
      const jsonMessage = JSON.parse(message.toString());
      switch (jsonMessage.action) {
        case 'ECHO':
          wsClient.send(jsonMessage.data);
          break;
        case 'PING':
          setTimeout(async () => {
            const resp = await getRepoId(jsonMessage.data);
            wsClient.send(JSON.stringify(resp));
          }, 2000);
          break;
        default:
          console.log('unknown command');
          break;
      }
    } catch (error) {
      console.log('Error', error);
    }
  });
  wsClient.on('close', () => {
    console.log('user disconnected');
  });
}

export const ethApi = () => {
  const wsServer = new WebSocket.Server({ port: 9000 });

  wsServer.on('connection', onConnect);
};
