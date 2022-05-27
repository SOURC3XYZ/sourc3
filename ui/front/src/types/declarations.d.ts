declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.wasm';
// For CSS
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// For LESS
declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

// For SCSS
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

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
  BeamModule: any;
  __REDUX_DEVTOOLS_EXTENSION__: () => any
}

declare interface EventTarget {
  value: string
}
