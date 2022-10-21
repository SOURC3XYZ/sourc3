import React, { useEffect } from 'react';
import { Preload } from '@components/shared';
import { useNavigate } from 'react-router-dom';

function GitAuth() {
  function closeWindow() {
    window.open('', '_self', '');
    window.close();
  }

  const navigate = useNavigate();

  useEffect(() => {
    const popupWindowURL = new URL(window.location.href);
    const code = popupWindowURL.searchParams.get('code');
    const state = popupWindowURL.searchParams.get('state');

    if (state?.includes('_github') && code) {
      localStorage.setItem('github', code);
      return closeWindow();
    }
    if (state?.includes('_engage') && code) {
      localStorage.setItem('github', code);
      return navigate(`/?engage=true&code=${code}`);
    }
    return undefined;
  }, []);
  return (
    <Preload messageBlack message="Wait a few sec..." />
  );
}

export default GitAuth;
