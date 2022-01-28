import { BeamAmmount } from '@libs/constants';
import { ObjectData, BeamReqAction } from '@types';

export const argsStringify = (args: BeamReqAction): string => Object
  .entries(args)
  .filter((arg) => arg[1].length)
  .map((arg) => arg.join('='))
  .join(',');

export const hexParser = (str: ObjectData) => {
  const bytes = new Uint8Array(
    str.match(/.{1,2}/g)
      ?.map((byte) => parseInt(byte, 16)) as number[]
  );
  return new TextDecoder().decode(bytes);
};

export const equalKeyIndex = (key: string, inputText: string) => key
  .toLowerCase()
  .search(inputText.toLowerCase());

export function searchFilter<T>(
  searchInputTxt: string,
  elements: T[],
  keysToEqual: (keyof T)[]
) {
  if (searchInputTxt) {
    return elements.filter((el) => {
      const entries = Object.entries(el) as [keyof T, T[keyof T]][];
      const filtered = entries
        .filter((field) => keysToEqual.find((key) => key === field[0]))
        .find(
          (field) => (
            typeof field[1] === 'string' || typeof field[1] === 'number')
            && ~(equalKeyIndex(String(field[1]), searchInputTxt))
        );
      if (filtered) return el;
      return null;
    });
  }
  return elements;
}

export const parseToGroth = (beams: number):number => {
  const numb = Math.ceil(beams * BeamAmmount.GROTHS_IN_BEAM);
  return Number(numb);
};

export const parseToBeam = (groth: number):string => {
  const numb = groth / BeamAmmount.GROTHS_IN_BEAM;
  return String(numb);
};

export const handleString = (next:string):boolean => {
  let result = true;
  const regex = new RegExp(/^-?\d+(\.\d*)?$/g);
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
