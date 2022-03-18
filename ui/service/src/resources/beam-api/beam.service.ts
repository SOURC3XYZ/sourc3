import { HTTP_MODE } from '../../common';
import { IApiReq } from '../../types';
import {
  reqTCP,
  reqHTTP
} from './beam.repository';

export const callApi = async (obj: IApiReq) => {
  try {
    const res = parseInt(`${HTTP_MODE}`, 10)
      ? await reqHTTP(obj)
      : await reqTCP(obj);
    return { isOk: true, res };
  } catch (error) {
    return { isOk: false, error };
  }
};
