import request from 'request';
import { WALLET } from '../../common';

export const resToBeamApi = async (
  obj: { [key: string]: number | string }
) => new Promise((resolve, reject) => {
  request(
    WALLET as string,
    {
      json: obj
    },

    (error, _info, body) => {
      if (error) reject(error);
      resolve(body);
    }
  );
});
