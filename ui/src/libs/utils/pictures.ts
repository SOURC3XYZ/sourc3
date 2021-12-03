import { RcFile } from 'antd/lib/upload';

export const hexEncodeU8A = (arr:Uint8Array) => arr
  .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const hexDecodeU8A = (str:string) => new Uint8Array(
  str.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) as number[]
);

export const uploadArtwork = (
  file: RcFile
):Promise<string> => new Promise((resolve) => {
  const name = file.name.split('.')[0];
  // name = [name.toUpperCase(), name.substring(1)].join('');
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = () => {
    const aver = Uint8Array.from([1]);
    const aname = new TextEncoder().encode(name);
    const asep = Uint8Array.from([0, 0]);
    const aimg = new Uint8Array(reader.result as ArrayBuffer);
    const hex = [
      hexEncodeU8A(aver),
      hexEncodeU8A(aname),
      hexEncodeU8A(asep),
      hexEncodeU8A(aimg)
    ].join('');
    console.log(hex);
    resolve(hex);
  };
});

export const parseToUrl = (hex: string) => {
  const data = hexDecodeU8A(hex);
  const nend = data.findIndex((val) => val === 0);
  const name = data[0] !== 1 || nend === -1 || nend + 1 === data.length
    ? 'unknown'
    : (new TextDecoder()).decode(data.subarray(1, nend));

  const bytes = data.subarray(nend + 2);
  const pic = URL.createObjectURL(
    new Blob([bytes], { type: 'image/jpeg' })
  );

  return { pic, name };
};
