import { ReactElement, useEffect } from 'react';

type PeloadProps = {
  isLoaded: boolean,
  callback?: () => void
  Fallback: (props:any) => JSX.Element;
  children: ReactElement<any, any>;
};

function PreloadComponent({
  isLoaded, callback, Fallback, children
}:PeloadProps) {
  useEffect(() => {
    console.log('preload', isLoaded);
    if (!isLoaded && callback) callback();
  }, [isLoaded]);

  if (isLoaded) return children;
  return <Fallback />;
}

export default PreloadComponent;
