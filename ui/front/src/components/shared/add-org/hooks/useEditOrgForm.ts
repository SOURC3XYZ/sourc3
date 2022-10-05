import { useObjectState, useUpload } from '@libs/hooks/shared';
import { Entries } from '@types';
import { useCallback, useEffect, useState } from 'react';
import { regExes } from './regex';

type InputChange<T> = React.ChangeEventHandler<T>;

export type FormFields = {
  old_name?:string;
  organization_name?:string
  about?:string;
  name:string;
  short_title:string;
  telegram:string;
  discord:string;
  website:string;
  instagram:string;
  logo_addr:string;
  twitter:string;
  linkedin:string;
};

export const useEditOrgForm = (props:FormFields, callback: (props:FormFields) => void) => {
  const [state, setState] = useObjectState({ ...props });
  const [imgParams, setImgParams] = useState<{ link: string, blob?: Blob } | null>(null);

  const { uploadToIpfs, getImgUrlFromIpfs } = useUpload();

  const {
    logo_addr: ipfsHash
  } = state;

  const [notValidItems, setNotValidItems] = useState<Set<keyof typeof regExes>>(new Set());

  const addKey = (key:keyof typeof regExes) => setNotValidItems((prev) => new Set(prev.add(key)));

  const removeKey = (key:keyof typeof regExes) => setNotValidItems(
    (prev) => new Set([...prev].filter((x) => x !== key))
  );

  const validate = (str:string, key:keyof typeof regExes) => {
    if (!str.length) return true;
    return !!str.match(regExes[key]);
  };

  const getSrc = async () => {
    if (ipfsHash) {
      const link = await getImgUrlFromIpfs(ipfsHash);
      if (link) setImgParams({ link });
    }
  };

  const generic = useCallback(<T extends Event>(e: T) => {
    const { id, value } = e.target as HTMLInputElement;
    const key = id.replace('org-', '') as keyof typeof regExes;

    if (regExes[key]) {
      const isValid = validate(value, key);
      if (!isValid) addKey(key);
      else removeKey(key);
    }

    setState({ [key]: `${value}` });
  }, [state]);

  const handleChange = generic as InputChange<HTMLInputElement>;
  const handleTextareaChange = generic as InputChange<HTMLTextAreaElement>;

  const handleOk = async () => {
    const toSend = { ...state };
    const entries = Object.entries(state) as Entries<typeof state>;
    entries.forEach((el) => {
      const [key, value] = el as [keyof typeof state, never];
      if (typeof value === 'string' && (value as string).length) {
        toSend[key] = `"${value}"` as never;
        return;
      }
      toSend[key] = value;
    });

    if (imgParams?.blob) {
      const { hash } = await uploadToIpfs(imgParams.blob);
      if (hash) toSend.logo_addr = hash;
    }
    callback(toSend);
  };

  const getImgHandler = useCallback((link:string, blob: Blob) => {
    setImgParams({ link, blob });
  }, [imgParams]);

  useEffect(() => {
    getSrc();
    const entries = Object.entries(state) as Entries<typeof state>;
    const notMatchArray:(keyof typeof regExes)[] = [];
    entries.forEach((el) => {
      const [key, value] = el as [keyof typeof regExes, string];
      const regex = regExes[key];
      if (regex && value.length && !value.match(regex)) notMatchArray.push(key);
    });
    setNotValidItems(new Set(notMatchArray));
  }, []);

  return {
    ...state,
    imgParams,
    notValidItems,
    validate,
    getImgHandler,
    handleOk,
    handleChange,
    handleTextareaChange
  };
};
