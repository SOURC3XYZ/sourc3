export function loadingData<T>(
  callback: (resolve: PromiseArg<T>, reject?: PromiseArg<T>) => void
) {
  return new Promise((resolve, reject) => { callback(resolve, reject); });
}
