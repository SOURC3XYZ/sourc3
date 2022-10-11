/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-shadow */
import { getQueryParam } from '@libs/utils';
import { notification } from 'antd';
import { NotificationPlacement } from 'antd/lib/notification';
import React, {
  memo, useCallback, useEffect, useState
} from 'react';
import { useParams } from 'react-router-dom';

export type objectType = {
  [key: string]: any
};
export type IResolveParams = {
  provider: string,
  data: objectType,
};
interface Props {
  state?: string
  scope?: string
  client_id: string
  className?: string
  redirect_uri: string
  // client_secret: string
  allow_signup?: boolean
  children?: React.ReactNode
  // onReject: (reject: string | objectType) => void
  onResolve: ({ provider, data }: IResolveParams) => void
}

const GITHUB_URL: string = 'https://github.com';
// const GITHUB_API_URL: string = 'https://api.github.com/'
// const PREVENT_CORS_URL: string = 'https://cors-anywhere.herokuapp.com'

export function LoginSocialGithub({
  state = '',
  scope = '',
  client_id,
  // client_secret,
  className = '',
  redirect_uri,
  allow_signup = false,
  children,
  onResolve
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { params } = useParams();

  const engage = getQueryParam(window.location.href, 'engage') || '';
  const code = getQueryParam(window.location.href, 'code') || '';

  useEffect(() => {
    const popupWindowURL = new URL(window.location.href);
    const code = popupWindowURL.searchParams.get('code');
    const state = popupWindowURL.searchParams.get('state');
    if (state?.includes('_github') && code) {
      localStorage.setItem('github', code);
      window.close();
    }
  }, []);

  const getAccessToken = (code: string) => {
    setIsProcessing(false);
    onResolve({ provider: 'github', data: { code } });
  };

  const handlePostMessage = async ({ type, code, provider }) => type === 'code'
         && provider === 'github'
         && code
         && getAccessToken(code);

  const onChangeLocalStorage = () => {
    const code = localStorage.getItem('github');
    if (code) {
      setIsProcessing(true);
      handlePostMessage({ provider: 'github', type: 'code', code });
      localStorage.removeItem('instagram');
      window.removeEventListener('storage', onChangeLocalStorage);
    }
  };

  const onLogin = () => {
    if (!isProcessing) {
      window.addEventListener('storage', onChangeLocalStorage);
      const oauthUrl = `
                ${GITHUB_URL}/login/oauth/authorize?client_id=${client_id}&scope=${encodeURIComponent(scope)}&state=_github&allow_signup=${allow_signup}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

      const width = 450;
      const height = 730;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      console.log('URL', oauthUrl);
      window.open(
        oauthUrl,
        'Github',
        `menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=${width}, height=${
          height
        }, top=${
          top
        }, left=${
          left}`
      );
    }
  };

  useEffect(() => {
    if (engage && code) {
      handlePostMessage({ provider: 'github', type: 'code', code });
    }
  }, [params]);

  return (
    <div className={className} onClick={onLogin}>
      {children}
    </div>
  );
}

export default LoginSocialGithub;
