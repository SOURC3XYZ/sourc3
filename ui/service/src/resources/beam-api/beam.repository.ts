import { Socket } from 'net';
import request from 'request';
import path from 'path';
import { HTTP_MODE, WALLET_API_PORT } from '../../common';
import { IApiReq } from '../../types';
import { binPath } from '../../utils';

let socket:Socket;
const sync = new Map<IApiReq['id'], any>();

export function getSyncParams() {
  return Array.from(sync.values());
}

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

export function reqStandardTCP(req:IApiReq) {
  return new Promise((resolve, reject) => {
    const client = new Socket();
    client.connect(Number(WALLET_API_PORT), '127.0.0.1', () => {
      console.log('Connected');
      if (Number(HTTP_MODE) && req.params) {
        delete req.params.contract;
        req.params
          .contract_file = path.join(binPath, 'app.wasm');
      }
      // TODO: DANIK, something wrong
      client.write(`${JSON.stringify(req)}\n`);
    });

    let acc = '';
    client.on('error', () => reject(new Error('connection error')));

    client.on('data', (data) => {
      try {
        acc += data;
        if (data.indexOf('\n') !== -1) {
          const res = JSON.parse(acc);
          resolve(res);
          client.destroy();
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function reqSyncTCP(req:IApiReq):Promise<void> {
  killSyncSocket();
  return new Promise((resolve, reject) => {
    socket = new Socket();
    socket.connect(Number(WALLET_API_PORT), '127.0.0.1', () => {
      console.log('Connected');
      socket.write(`${JSON.stringify(req)}\n`);
    });

    let acc = '';

    socket.on('error', () => reject(new Error('connection error')));

    socket.on('data', (data) => {
      acc += data;
      if (data.indexOf('\n') !== -1) {
        const res = acc.split('\n')
          .filter(Boolean)
          .map((el) => JSON.parse(el));
        res.forEach((el) => sync.set(el.id, el));
        resolve();
        console.log('Received:', res);
        acc = '';
      }
    });
  });
}

export async function reqTCP(req:IApiReq) {
  if (req.method === 'ev_subunsub') {
    await reqSyncTCP(req);
    return sync.get(req.id);
  }
  return reqStandardTCP(req);
}
