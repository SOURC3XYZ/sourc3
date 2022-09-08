import { useObjectState, useUpload } from '@libs/hooks/shared';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { Entries, Organization } from '@types';
import { useCallback, useEffect, useState } from 'react';
import { regExes } from './regex';

type InputChange<T> = React.ChangeEventHandler<T>;

export const useEditOrgForm = (props:Organization) => {
  const [state, setState] = useObjectState({
    organization_id: props.organization_id,
    name: props.organization_name,
    short_title: props.organization_short_title,
    about: props.organization_about,
    telegram: props.organization_telegram,
    discord: props.organization_discord,
    website: props.organization_website,
    instagram: props.organization_instagram,
    logo_addr: props.organization_logo_ipfs_hash,
    twitter: props.organization_twitter,
    linkedin: props.organization_twitter
  });
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

  const { setModifyOrg } = useEntitiesAction();

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
    setModifyOrg(toSend);
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
