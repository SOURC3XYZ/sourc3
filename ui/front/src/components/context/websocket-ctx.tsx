import { CONFIG, EVENTS } from '@libs/constants';
import { useCustomEvent } from '@libs/hooks/shared';
import { WSSendArgs } from '@types';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { WebSocketContext } from './shared-context';

type WebSocketComponetnCtx = {
  children: JSX.Element
};

export function Sourc3WSProvider({ children }:WebSocketComponetnCtx) {
  const [connection, setConnection] = useState<WebSocket | null>(null);

  const manageEvent = useCustomEvent(EVENTS.WS_PING);

  const connectToDesktop = () => new Promise<WebSocket>((resolve) => {
    const ws = new WebSocket(CONFIG.DESKTOP_WS);
    ws.onopen = function () {
      console.log('connected');
      resolve(ws);
    };
  });

  const manageConnection = async () => {
    const ws = await connectToDesktop();
    setConnection(ws);
    ws.onmessage = function (message) {
      if (message.data) {
        try {
          const wsData = JSON.parse(message.data);
          if (wsData.action === 'TX_SEND') {
            manageEvent(wsData.data);
            console.log('Message: %s', message.data);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    ws.onclose = () => {
      setConnection(null);
      console.log('ws closed');
    };
  };

  const wsSendPing = useCallback((obj: WSSendArgs) => {
    if (connection) {
      connection.send(JSON.stringify(obj));
    }
  }, [connection]);

  useEffect(() => () => connection?.close(), []);

  const isConnected = !!connection;

  const args = useMemo(() => [isConnected, manageConnection, wsSendPing] as const, [isConnected]);

  return (
    <WebSocketContext.Provider value={args}>
      {children}
    </WebSocketContext.Provider>
  );
}
