import {
  BeamButton, Search
} from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Input } from 'antd';
import img from '@assets/img/source-header-logo.svg';
import iconAvatar from '@assets/img/icon-avatar.svg';
import iconButtonArrowDown from '@assets/img/icon-arrow-button-down.svg';
import Modal from 'antd/lib/modal/Modal';
import { useHeader } from '@libs/hooks/container/header';
import styles from './header.module.scss';

type HeaderPropsType = {
  pkey:string
  balance: number,
  searchText:string,
  isOnLending: boolean,
  setInputText: (inputText: string) => void;
  connectToExtention: () => void;
  createRepos: (repo_name:string) => void,
};

function Header({
  balance, pkey, searchText, isOnLending, setInputText, connectToExtention, createRepos
}:HeaderPropsType) {
  const textColorClass = isOnLending ? styles.textColor : styles.textColorActive;

  const containerProps = useHeader({
    pkey,
    searchText,
    isOnLending,
    setInputText,
    connectToExtention,
    createRepos
  });

  const {
    isPkey,
    isModalVisible,
    inputRepoName,
    setInputTextWrap,
    onConnect,
    showModal,
    handleOk,
    handleCancel,
    handleChange
  } = containerProps;

  const headerElements = (
    <div key="header1" className={styles.navWrapper}>
      <Link to="/">
        <img className={styles.logo} alt="source" src={img} />
      </Link>
      <ul className={[styles.navList, textColorClass].join(' ')}>
        <li>
          <Link className={textColorClass} to="/repos/all/1">
            Repositiories
          </Link>
        </li>
        <li>
          <Link className={textColorClass} to="/repos/all/1">
            Explore
          </Link>
        </li>
      </ul>
    </div>
  );

  const manageElement = isPkey && (
    <div key="header2" className={styles.manage}>
      <ul className={styles.listManage}>
        <li>
          <BeamButton callback={showModal}>New</BeamButton>
        </li>
        <li>
          <button
            type="button"
            className={styles.balance}
          >
            {balance || 0}
            SC3
          </button>
        </li>
        <li>
          <div className={styles.profile}>
            <img src={iconAvatar} alt="avatar" />
            <span className={textColorClass}>Long John Silver</span>
            <img src={iconButtonArrowDown} alt="down" />
          </div>

        </li>
      </ul>
    </div>
  );

  const searchElement = !isPkey && (
    <div key="header3" className={styles.connect}>
      <Search
        className={isOnLending ? styles.lendosInput : ''}
        text={searchText}
        placeholder="Search"
        setInputText={setInputTextWrap}
      />
      <BeamButton callback={onConnect}>
        connect
      </BeamButton>
    </div>
  );

  return (
    <div
      className={styles.wrapper}
    >
      <div className={styles.nav}>
        {headerElements}
        {manageElement}
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
    </div>
  );
}

const mapState = (
  { app: { pkey, balance }, repos: { searchText } }: RootState
) => ({
  searchText,
  pkey,
  balance
});

const mapDispatch = (dispatch:AppThunkDispatch) => ({
  setInputText: (text: string) => dispatch(AC.setSearch(text)),
  connectToExtention: () => dispatch(thunks.connectExtension()),
  createRepos: (repo_name:string) => {
    if (repo_name === null) return;
    dispatch(thunks.createRepos(repo_name));
  }
});

export default connect(mapState, mapDispatch)(Header);
