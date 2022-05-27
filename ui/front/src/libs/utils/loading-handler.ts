import { PromiseArg } from '@types';

export function loadingData<T, E>(
  callback: (resolve: PromiseArg<T>, reject?: PromiseArg<E>) => void
) {
  return new Promise((resolve, reject) => { callback(resolve, reject); });
}

export const checkExtension = (id:string, src:string):Promise<void> => new Promise(
  (resolve, reject) => {
    const e = new Image();
    e.src = `chrome-extension://${id}/${src}`;
    e.onload = () => resolve();
    e.onerror = () => reject();
  }
);
