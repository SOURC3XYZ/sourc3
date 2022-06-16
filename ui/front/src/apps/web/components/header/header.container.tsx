import {
  AutocompeteSearch,
  ConnectBtn,
  ProfileBlock
} from '@components/shared';
import { Link } from 'react-router-dom';
import img from '@assets/img/source-header-logo.svg';
import { useHeader } from '@libs/hooks/container/header';
import { useMemo } from 'react';
import styles from './header.module.scss';

type HeaderPropsType = {
  isOnLending?: boolean,
  balance?: number,
  desktop: boolean,
};

function Header({ isOnLending, balance, desktop }:HeaderPropsType) {
  // const textColorClass = isOnLending ? styles.textColor : styles.textColorActive;

  const containerProps = useHeader();
  console.log(balance);

  const {
    pkey,
    onConnect
  } = containerProps;

  const autoCompleteClassName = isOnLending ? styles.lendosInput : '';

  const headerClassName = isOnLending ? styles.header : styles.headerActive;

  const headerElements = (
    <div className={styles.navWrapper}>
      <Link to="/">
        <img className={styles.logo} alt="source" src={img} />
      </Link>
      <ul className={[styles.navList, styles.textColor].join(' ')}>
        <li>
          <Link className={styles.textColor} to="/repos/all/1">
            Repositories
          </Link>
        </li>
        <li>
          <Link className={styles.textColor} to="/organizations/all/1">
            Organizations
          </Link>
        </li>
      </ul>
    </div>
  );

  const searchElement = useMemo(() => (
    <div className={styles.connect}>
      {isOnLending && (
        <AutocompeteSearch
          className={autoCompleteClassName}
          placeholder="Search"
        />
      )}
      { !desktop ? (
        <ConnectBtn
          pkey={pkey}
          onConnect={onConnect}
        />
      ) : (
        <ProfileBlock
          pKey={pkey}
        />
      ) }
    </div>
  ), [isOnLending, pkey]);

  return (
    <header className={headerClassName}>
      <div className={styles.nav}>
        {headerElements}
        {searchElement}
      </div>
    </header>
  );
}

export default Header;
