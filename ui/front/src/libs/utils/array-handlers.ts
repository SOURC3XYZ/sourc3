const randomiser = (i:number, arr: number[], length:number):number => {
  const randomNumb = Math.floor(Math.random() * length);
  if (arr.includes(randomNumb)) return randomiser(i, arr, length);
  return randomNumb;
};

export function shuffle<T>(array: T[]) {
  const shuffled = [];
  for (let i = array.length - 1; i >= 0; i--) {
    const j = randomiser(i, shuffled, array.length);
    shuffled.push(j);
  }
  return shuffled;
}

export function unorderedRemove<T>(arr:T[], i:number):void {
  if (i <= 0 || i >= arr.length) {
    return;
  }
  if (i < arr.length - 1) {
    arr[i] = arr[arr.length - 1];
  }
  arr.length -= 1;
}
