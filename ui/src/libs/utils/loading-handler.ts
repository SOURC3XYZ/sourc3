export function loadingData<T>(
  callback: (resolve: (value: T) => void) => void
) {
  return new Promise((resolve) => callback(resolve));
}
