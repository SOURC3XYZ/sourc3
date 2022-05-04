import {
  BeamButton, Search
} from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { ChangeEvent, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Input } from 'antd';
import img from '@assets/img/source-header-logo.svg';
import iconAvatar from '@assets/img/icon-avatar.svg';
import iconButtonArrowDown from '@assets/img/icon-arrow-button-down.svg';
import Modal from 'antd/lib/modal/Modal';
import { useObjectState } from '@libs/hooks/shared';
import styles from './header.module.scss';

type HeaderPropsType = {
  pkey:string
  balance: number,
  searchText:string,
  setInputText: (inputText: string) => void;
  connectToExtention: () => void;
  createRepos: (repo_name:string) => void,
};

const initialState = {
  isLoading: true,
  isModalVisible: false,
  inputRepoName: ''
};

function Header({
  balance, pkey, searchText, setInputText, connectToExtention, createRepos
}:HeaderPropsType) {
  const isPkey = Boolean(pkey);
  const setInputTextWrap = (text: string) => setInputText(text);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isOnLendos = pathname === '/';

  const textColor = searchText || !isOnLendos ? 'black' : 'white';

  const bgColor = searchText || !isOnLendos ? 'white' : 'black';

  const [state, setState] = useObjectState<typeof initialState>(initialState);
  const { isModalVisible, inputRepoName } = state;

  useEffect(() => {
    if (searchText.length && isOnLendos) {
      navigate('repos/all/1');
    }
  }, [searchText]);

  const onConnect = () => {
    connectToExtention();
  };
  const showModal = () => {
    setState({ isModalVisible: true });
  };

  const handleOk = () => {
    setState({ isModalVisible: false });
    createRepos(inputRepoName);
  };

  const handleCancel = () => {
    setState({ isModalVisible: false });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ inputRepoName: e.target.value });
  };

  const headerElements = (text:string, color:string) => [
    <div key="header1" className={styles.navWrapper}>
      <Link to="/">
        <img className={styles.logo} alt="source" src={img} />
      </Link>
      <ul className={styles.navList} style={{ color }}>
        <li>
          <Link style={{ color, textDecoration: 'none' }} to="/repos/all/1">
            Repositiories
          </Link>
        </li>
        <li>
          <Link style={{ color, textDecoration: 'none' }} to="/repos/all/1">
            Explore
          </Link>
        </li>
      </ul>
    </div>,
    // isPkey && <Balance current={balance} />,
    // isPkey && <AddButton />,
    // isPkey && <Profile pKey={pkey} />,
    isPkey && (
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
              <span style={{ color }}>Long John Silver</span>
              <img src={iconButtonArrowDown} alt="down" />
            </div>

          </li>
        </ul>
      </div>
    ),
    !isPkey && (
      <div key="header3" className={styles.connect}>
        <Search
          className={color === 'black' ? '' : styles.lendosInput}
          text={text}
          placeholder="Search"
          setInputText={setInputTextWrap}
        />
        <BeamButton callback={onConnect}>
          connect
        </BeamButton>
      </div>
    )
  ];

  const View = useCallback(({ text, color }: { [key:string]: any }) => (
    <div className={styles.nav}>
      {headerElements(text, color)}
    </div>
  ), [pkey]);

  return (
    <div
      className={styles.wrapper}
      style={{ background: bgColor }}
    >
      <View text={searchText} color={textColor} />
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
