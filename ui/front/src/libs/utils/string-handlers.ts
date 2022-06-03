import { BeamAmmount } from '@libs/constants';
import { ObjectData, BeamReqAction } from '@types';

export const argsStringify = (args: BeamReqAction): string => Object
  .entries(args)
  .filter((arg) => arg[1].length)
  .map((arg) => arg.join('='))
  .join(',');

export function arrayBufferToString(buffer:number[]) {
  const bytes = new Uint8Array(buffer);
  return new TextDecoder().decode(bytes);
}

export const str2bytes = (str: string) => {
  const utf8Encode = new TextEncoder();
  return Array.from(utf8Encode.encode(str));
};

export const hexParser = (str: ObjectData) => {
  const bytes = new Uint8Array(
    str.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) as number[]
  );
  return new TextDecoder().decode(bytes);
};

export function buf2hex(buffer: number[] | ArrayBuffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

export const parseToGroth = (beams: number):number => {
  const numb = Math.ceil(beams * BeamAmmount.GROTHS_IN_BEAM);
  return Number(numb);
};

export const parseToBeam = (groth: number):string => {
  const numb = groth / BeamAmmount.GROTHS_IN_BEAM;
  return String(numb);
};

export const equalKeyIndex = (key: string, inputText: string) => key
  .toLowerCase()
  .search(inputText.toLowerCase());

export const handleString = (next:string):boolean => {
  let result = true;
  const regex = /^-?\d+(\.\d*)?$/g;
  const floatValue = parseFloat(next);
  const afterDot = next.indexOf('.') > 0
    ? next.substring(next.indexOf('.') + 1)
    : '0';
  if (
    (next && !String(next).match(regex))
    || next === ''
    || (String(next).length > 1
    && String(next)[0] === '0'
    && next.indexOf('.') < 0)
    || (parseInt(afterDot, 10) === 0 && afterDot.length > 7)
    || afterDot.length > 8
    || (floatValue === 0 && next.length > 1 && next[1] !== '.')
    || (floatValue < 1 && next.length > 10)
    || floatValue === 0
    || (floatValue > 0 && (
      floatValue < BeamAmmount.MIN_AMOUNT || floatValue > BeamAmmount.MAX_AMOUNT
    ))
  ) {
    result = false;
  }
  return result;
};

export const fullBranchName = (clippedName:string, base: 'refs/heads/') => `${base}${clippedName}`;

export const clipString = (fullName:string, cut = 'refs/heads/') => fullName.replace(cut, '');

export function textEllipsis(
  str:string,
  maxLength:number,
  { side = 'end', ellipsis = '...' } = {}
) {
  if (str.length > maxLength) {
    switch (side) {
      case 'start':
        return ellipsis + str.slice(-(maxLength - ellipsis.length));
      case 'end':
      default:
        return str.slice(0, maxLength - ellipsis.length) + ellipsis;
    }
  }
  return str;
}

export function timeSince(date: number) {
  const today = Number(new Date());
  const seconds = Math.floor((today - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    const floor = ~~interval;
    return `${floor} year${floor === 1 ? '' : 's'}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const floor = ~~interval;
    return `${floor} month${floor === 1 ? '' : 's'}`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const floor = ~~interval;
    return `${floor} day${floor === 1 ? '' : 's'}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const floor = ~~interval;
    return `${floor} hour${floor === 1 ? '' : 's'}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const floor = ~~interval;
    return `${floor} minute${floor === 1 ? '' : 's'}`;
  }
  const floor = ~~interval;
  return `${floor} second${floor === 1 ? '' : 's'}`;
}

export const dateCreator = (mls: number) => {
  const date = +new Date(mls);
  return timeSince(date);
  // return date.toLocaleString();
};
