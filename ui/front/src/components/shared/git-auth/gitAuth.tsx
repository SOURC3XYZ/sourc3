import React, { useEffect } from 'react';

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
    <div />
  );
}

export default GitAuth;
