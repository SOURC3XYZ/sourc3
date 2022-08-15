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
      connection.send(JSON.stringify({ action: 'PING', data: JSON.stringify({}) }));
    }
  }, [connection]);

  useEffect(() => {
    manageConnection();
    return () => connection?.close();
  }, []);

  const isConnected = !!(connection);

  return [isConnected, wsSendPing] as const;
};
