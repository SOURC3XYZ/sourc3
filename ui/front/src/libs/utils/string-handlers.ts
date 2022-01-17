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
