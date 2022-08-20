/* eslint-disable no-case-declarations */
import WebSocket from 'ws';

export const wsConnection = { wsSend: null as any };

function onConnect(wsClient:WebSocket) {
  console.log('new user');
  wsClient.send('Hi!');
  wsConnection.wsSend = wsClient.send.bind(wsClient);

  wsClient.on('message', async (message) => {
    console.log(message.toString());
    try {
      const jsonMessage = JSON.parse(message.toString());
      switch (jsonMessage.action) {
        case 'ECHO':
          // wsClient.send(jsonMessage.data);
          break;
        case 'PING':
          // const resp = await getRepoId(jsonMessage.data);
          // wsClient.send(JSON.stringify(resp));
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
