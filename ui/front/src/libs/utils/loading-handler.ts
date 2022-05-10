import { PromiseArg } from '@types';

export function loadingData<T, E>(
  callback: (resolve: PromiseArg<T>, reject?: PromiseArg<E>) => void
) {
  return new Promise((resolve, reject) => { callback(resolve, reject); });
}
