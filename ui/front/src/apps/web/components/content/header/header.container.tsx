import {
  AutocompeteSearch,
  ConnectBtn
} from '@components/shared';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Input } from 'antd';
import img from '@assets/img/source-header-logo.svg';
import Modal from 'antd/lib/modal/Modal';
import { useHeader } from '@libs/hooks/container/header';
import { useMemo } from 'react';
import styles from './header.module.scss';

type HeaderPropsType = {
  pkey:string
  isOnLending: boolean,
  connectToExtention: () => void;
  createRepos: (repo_name:string) => void,
};

function Header({
  pkey, isOnLending, connectToExtention, createRepos
}:HeaderPropsType) {
  // const textColorClass = isOnLending ? styles.textColor : styles.textColorActive;

  const containerProps = useHeader({
    pkey,
    isOnLending,
    connectToExtention,
    createRepos
  });

  const {
    isPkey,
    isModalVisible,
    inputRepoName,
    onConnect,
    handleOk,
    handleCancel,
    handleChange
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
            Repositiories
          </Link>
        </li>
        <li>
          <Link className={styles.textColor} to="/repos/all/1">
            Explore
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
      <ConnectBtn isLogined={isPkey} onConnect={onConnect} />
    </div>
  ), [isOnLending, isPkey]);

  return (
    <header className={headerClassName}>
      <div className={styles.nav}>
        {headerElements}
        {searchElement}
      </div>
      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
      >
        <Input
          placeholder="Enter name repository"
          value={inputRepoName}
          onChange={handleChange}
          onPressEnter={handleOk}
        />
      </Modal>
    </header>
  );
}

const mapState = (
  { app: { pkey, balance } }: RootState
) => ({
  pkey,
  balance
});

const mapDispatch = (dispatch:AppThunkDispatch) => ({
  connectToExtention: () => dispatch(thunks.connectExtension()),
  createRepos: (repo_name:string) => {
    if (repo_name === null) return;
    dispatch(thunks.createRepos(repo_name));
  }
});

export default connect(mapState, mapDispatch)(Header);
