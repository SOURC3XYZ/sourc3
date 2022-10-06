import React, { useEffect } from 'react';
import { Preload } from '@components/shared';

function GitAuth() {
  useEffect(() => {
    const popupWindowURL = new URL(window.location.href);
    const code = popupWindowURL.searchParams.get('code');
    const state = popupWindowURL.searchParams.get('state');
    if (state?.includes('_github') && code) {
      localStorage.setItem('github', code);
      window.close();
    }
  }, []);
  return (
    <Preload messageBlack message="Waite a few sec..." />
  );
}

export default GitAuth;
