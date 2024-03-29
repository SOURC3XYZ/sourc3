import {
  ConnectBtn,
  // AutocompeteSearch,
  ProfileBlock
} from '@components/shared';
import { Link } from 'react-router-dom';
import img from '@assets/img/source-header-logo-alpha.svg';
import { useHeader } from '@libs/hooks/container/header';
import { useMemo } from 'react';
import { GitConnectAuth } from '@components/shared/git-auth';
import { useSelector } from '@libs/redux';
import styles from './header.module.scss';

type HeaderPropsType = {
  isOnLending?: boolean,
  desktop?: boolean,
};

function Header({ isOnLending, desktop }:HeaderPropsType) {
  // const textColorClass = isOnLending ? styles.textColor : styles.textColorActive;

  const containerProps = useHeader();
  const {
    pkey,
    users,
    isVisible,
    onConnect
  } = containerProps;

  const isAuth = Boolean(useSelector((state) => state.profile.data.token));
  // const autoCompleteClassName = isOnLending ? styles.lendosInput : '';

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
          <Link className={styles.textColor} to="/organizations-list/all/1">
            Organizations
          </Link>
        </li>
      </ul>
    </div>
  );

  const searchElement = useMemo(() => (
    <div className={styles.connect}>
      { !desktop ? (
        <>
          {pkey && (
            <ProfileBlock
              pKey={pkey}
              profile
            />
          )}
          <ConnectBtn
            pkey={pkey}
            users={users}
            onConnect={onConnect}
          />
          {!isOnLending && <GitConnectAuth small name="Connect Github" />}
          {isAuth ? <ProfileBlock git /> : null}
        </>
      ) : (

        <ProfileBlock
          balance
          profile
          pKey={pkey}
        />
      ) }
    </div>
  ), [isOnLending, pkey, users, isAuth]);

  const header = useMemo(() => (isVisible ? (
    <header className={headerClassName}>
      <div className={styles.nav}>
        {headerElements}
        {searchElement}
      </div>
    </header>
  ) : null), [isVisible, pkey, isOnLending, isAuth]);

  return header;
}

export default Header;
