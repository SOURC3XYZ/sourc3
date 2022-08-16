import { useCallback, useEffect, useState } from 'react';

export const useConnectFromDesktop = () => {
  const [connection, setConnection] = useState<WebSocket | null>(null);

  const connectToDesktop = () => new Promise<WebSocket>((resolve) => {
    const ws = new WebSocket('ws://localhost:9000');
    ws.onopen = function () {
      console.log('connected');
      resolve(ws);
    };
  });

  const manageConnection = async () => {
    const ws = await connectToDesktop();
    setConnection(ws);
    ws.onmessage = function (message) {
      console.log('Message: %s', message.data);
    };
  };

  const wsSendPing = useCallback(() => {
    if (connection) {
      connection.send(JSON.stringify({
        action: 'PING',
        data: {
          jsonrpc: '2.0',
          id: 6,
          method: 'getRepoId',
          params: {
            owner: '0xbDAA766458f33a0cb56d42F70060d5F4Cbb927A4',
            name: 'test_2'
          }
        }
      }));
    }
  }, [connection]);

  useEffect(() => {
    manageConnection();
    return () => connection?.close();
  }, []);

  const isConnected = !!(connection);

  return [isConnected, wsSendPing] as const;
};
