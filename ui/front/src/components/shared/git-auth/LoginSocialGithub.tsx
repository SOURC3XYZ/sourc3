/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-shadow */
import React, {
  memo, useCallback, useEffect, useState
} from 'react';

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

export const LoginSocialGithub = memo(
  ({
    state = 'DCEeFWf45A53sdfKef424',
    scope = '',
    client_id,
    // client_secret,
    className = '',
    redirect_uri,
    allow_signup = false,
    children,
    // onReject,
    onResolve
  }: Props) => {
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
      const popupWindowURL = new URL(window.location.href);
      const code = popupWindowURL.searchParams.get('code');
      const state = popupWindowURL.searchParams.get('state');
      if (state?.includes('_github') && code) {
        localStorage.setItem('github', code);
        window.close();
      }
    }, []);

    const getAccessToken = useCallback(
      (code: string) => {
        setIsProcessing(false);
        onResolve({ provider: 'github', data: { code } });
      },
      [onResolve]
    );

    const handlePostMessage = useCallback(
      async ({ type, code, provider }) => type === 'code'
         && provider === 'github'
         && code
         && getAccessToken(code),
      [getAccessToken]
    );

    const onChangeLocalStorage = useCallback(() => {
      window.removeEventListener('storage', onChangeLocalStorage, false);
      const code = localStorage.getItem('github');
      if (code) {
        setIsProcessing(true);
        handlePostMessage({ provider: 'github', type: 'code', code });
        localStorage.removeItem('instagram');
      }
    }, []);

    const onLogin = useCallback(() => {
      if (!isProcessing) {
        window.addEventListener('storage', onChangeLocalStorage, false);
        const oauthUrl = `
                ${GITHUB_URL}/login/oauth/authorize?client_id=${client_id}&scope=read:user%20user:email%20public_repo&${state}_github&redirect_uri=${redirect_uri}&allow_signup=${allow_signup}`;

        const width = 450;
        const height = 730;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
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
    }, [isProcessing, client_id, scope, state, redirect_uri, allow_signup]);

    return (
      <div className={className} onClick={onLogin}>
        {children}
      </div>
    );
  }
);

export default LoginSocialGithub;
