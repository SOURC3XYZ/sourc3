import { useWebApp } from '@libs/hooks/container/web-app';
import { useEffect } from 'react';

function AppExperimental() {
  const { isApiConnected, connectBeamApi } = useWebApp();

  useEffect(() => {
    if (!isApiConnected) connectBeamApi();
  });
  return <h1>{`${isApiConnected}`}</h1>;
}

export default AppExperimental;
