import request from 'request';
import { WALLET_API_PORT } from '../../common';

export const resToBeamApi = async (
  obj: { [key: string]: number | string }
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
