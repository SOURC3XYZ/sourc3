export const hexEncodeU8A = (arr:Uint8Array) => arr
  .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const hexDecodeU8A = (str:string) => new Uint8Array(
  str.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) as number[]
);

export const uploadArtwork = (
  file: Blob
):Promise<number[]> => new Promise((resolve) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = () => {
    const bytes = new Uint8Array(reader.result as ArrayBuffer);
    resolve(Array.from(bytes));
  };
});

export const parseToUrl = (hex: string) => {
  const data = hexDecodeU8A(hex);
  const pic = URL.createObjectURL(
    new Blob([data], { type: 'image/png' })
  );

  return pic;
};
