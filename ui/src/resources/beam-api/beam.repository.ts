import { Socket } from 'net';
import request from 'request';
import { WALLET_API_PORT } from '../../common';
import { IApiReq } from '../../types';

let socket:Socket;
let callIndex = 0;
const calls: { [key:string]: any } = {};

export function killSyncSocket() {
  if (socket) {
    socket.destroy();
    return socket.destroyed;
  } return true;
}

export const reqHTTP = async (
  obj: IApiReq
) => new Promise((resolve, reject) => {
  request(
    `http://127.0.0.1:${WALLET_API_PORT}/api/wallet`,
    {
      json: obj
    },

    (error, _info, body) => {
      if (error) reject(error);
      resolve(body);
    }
  );
});

export const onResponce = (response: string):void => {
  try {
    const answer = JSON.parse(response);

    const nocback = () => {
      // TODO: comming soon
    };

    const { id } = answer;
    const cback = calls[id] || nocback;
    delete calls[id];

    return cback(answer);
  } catch (err) {
    console.log(`Failed to parse Wallet API response\n\t${response}\n\t${err}`);
    return undefined;
  }
};

export const tcpFactory = () => new Promise<void>((resolve) => {
  if (socket && !socket.destroyed) {
    resolve();
    return;
  }
  socket = new Socket();
  socket.connect(Number(WALLET_API_PORT), '127.0.0.1', () => {
    console.log('tcp сonnected');
    let acc = '';

    socket.on('close', () => {
      console.log('tcp connection closed');
    });
    socket.on('data', (data) => {
      acc += data.toString();

      while (true) {
        const br = acc.indexOf('\n');
        if (br === -1) return;

        const split = acc.split('\n');
        const response = split[0];
        acc = split.slice(1).join('\n');
        if (response) onResponce(response);
      }
    });
    resolve();
  });
});

export async function reqTCP(req:IApiReq) {
  await tcpFactory();
  req.id = ['call', callIndex++].join('-');
  socket.write(`${JSON.stringify(req)}\n`);
  return new Promise((resolve) => {
    calls[req.id] = resolve;
  });
}
