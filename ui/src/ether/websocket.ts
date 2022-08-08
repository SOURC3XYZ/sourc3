import WebSocket from 'ws';
import { getRepoId } from './eth-api';

function onConnect(wsClient:WebSocket) {
  console.log('Новый пользователь');
  // отправка приветственного сообщения клиенту
  wsClient.send('Привет');
  wsClient.on('message', (message) => {
    console.log(message.toString());
    try {
      // сообщение пришло текстом, нужно конвертировать в JSON-формат
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
          console.log('Неизвестная команда');
          break;
      }
    } catch (error) {
      console.log('Ошибка', error);
    }
    /* обработчик сообщений от клиента */
  });
  wsClient.on('close', () => {
    // отправка уведомления в консоль
    console.log('Пользователь отключился');
  });
}

export const ethApi = () => {
  const wsServer = new WebSocket.Server({ port: 9000 });

  wsServer.on('connection', onConnect);
};
