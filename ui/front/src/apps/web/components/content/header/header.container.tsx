import {
  AddButton, Balance, Profile, Search
} from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import img from '@assets/img/source-header-logo.svg';
import styles from './header.module.scss';

type HeaderPropsType = {
  pkey:string
  balance: number,
  searchText:string,
  setInputText: (inputText: string) => void;
  connectToExtention: () => void
};

const Header = ({
  balance, pkey, searchText, setInputText, connectToExtention
}:HeaderPropsType) => {
  const isPkey = Boolean(pkey);
  const setInputTextWrap = (text: string) => setInputText(text);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isOnLendos = pathname === '/';

  const textColor = searchText || !isOnLendos ? 'black' : 'white';

  const bgColor = searchText || !isOnLendos ? 'white' : 'black';

  console.log(bgColor);
  console.log(searchText.length);

  useEffect(() => {
    if (searchText.length && isOnLendos) {
      navigate('repos/all/1');
    }
  }, [searchText]);

  const onConnect = () => {
    connectToExtention();
  };

  const headerElements = (text:string, color:string) => [
    <div className={styles.navWrapper}>
      <img className={styles.logo} alt="source" src={img} />
      <ul className={styles.navList} style={{ color }}>
        <li>Repositiories</li>
        <li>Explore</li>
      </ul>
    </div>,
    isPkey && <Balance current={balance} />,
    isPkey && <AddButton />,
    isPkey && <Profile pKey={pkey} />,
    !isPkey && (
      <div className={styles.connect}>
        <Search
          text={text}
          placeholder="Search"
          setInputText={setInputTextWrap}
        />
        <button
          type="button"
          onClick={onConnect}
        >
          connect

        </button>
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
    </div>
  );
};

const mapState = (
  { app: { pkey, balance }, repos: { searchText } }: RootState
) => ({
  searchText,
  pkey,
  balance
});

const mapDispatch = (dispatch:AppThunkDispatch) => ({
  setInputText: (text: string) => dispatch(AC.setSearch(text)),
  connectToExtention: () => dispatch(thunks.connectExtension())
});

export default connect(mapState, mapDispatch)(Header);
