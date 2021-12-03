declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.wasm';
declare module 'qwebchannel' {
  import { QBEAM } from '@types';

  export class QWebChannel {
    constructor(
      transport: WebSocket,
      initCallback: (channel: QWebChannel) => void
    );

    objects: {
      BEAM: QBEAM;
    };
  }
}
declare interface Window {
  qt: QWebChannelTransport;
  BeamApi: QObject;
}
