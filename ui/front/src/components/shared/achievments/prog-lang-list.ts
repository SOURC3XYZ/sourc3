import early_joiner from '@assets/achievements/early_joiner.svg';
import lang_jscript from '@assets/achievements/lang_jscript.svg';
import lang_python from '@assets/achievements/lang_python.svg';
import lang_cpp from '@assets/achievements/lang_cpp.svg';
import lang_rust from '@assets/achievements/lang_rust.svg';
import lang_solidity from '@assets/achievements/lang_solidity.svg';

type LangItem = {
  title: string;
  img: string;
  color: string;
};

export const achievementsData = new Map<string, LangItem>()
  .set('lang_jscript', { title: 'JavaScript', img: lang_jscript, color: '#FDD83C' })
  .set('lang_cpp', { title: 'C++', img: lang_cpp, color: '#5E98CF' })
  .set('lang_python', { title: 'Python', img: lang_python, color: 'green' })
  .set('lang_rust', { title: 'Rust', img: lang_rust, color: 'green' })
  .set('lang_solidity', { title: 'Solidity', img: lang_solidity, color: 'green' })
  .set('early_joiner', { title: 'Early Joiner', img: early_joiner, color: '#FFAB73' });
