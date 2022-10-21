import React from 'react';
import ContentLoader from 'react-content-loader';

function MyLoader(props:any) {
  return (
    <ContentLoader
      speed={2}
      width={1240}
      height={600}
      viewBox="0 0 1240 600"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      {...props}
    >
      <rect x="15" y="342" rx="8" ry="8" width="151" height="33"/>
      <circle cx="88" cy="117" r="79" />
      <circle cx="929" cy="54" r="10" />
      <circle cx="961" cy="54" r="10" />
      <circle cx="991" cy="54" r="10" />
      <circle cx="39" cy="403" r="18" />
      <circle cx="89" cy="402" r="18" />
      <circle cx="142" cy="401" r="18" />
      <rect x="46" y="214" rx="8" ry="8" width="121" height="17" />
      <rect x="45" y="252" rx="8" ry="8" width="121" height="14" />
      <rect x="44" y="283" rx="8" ry="8" width="124" height="14" />
      <circle cx="25" cy="224" r="10" />
      <circle cx="25" cy="259" r="10" />
      <circle cx="25" cy="292" r="10" />
      <rect x="200" y="97" rx="8" ry="8" width="800" height="124" />
      <rect x="200" y="43" rx="8" ry="8" width="227" height="24" />
      <rect x="200" y="258" rx="8" ry="8" width="800" height="99" />
      <rect x="200" y="376" rx="8" ry="8" width="800" height="99" />
      <rect x="200" y="494" rx="8" ry="8" width="800" height="99" />
    </ContentLoader>
  );
}

export default MyLoader;
