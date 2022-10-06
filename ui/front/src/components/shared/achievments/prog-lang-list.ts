import js from '@assets/icons/js-icon.svg';
import cpp from '@assets/icons/cpp-icon.svg';
import python from '@assets/icons/python-icon.svg';

type LangItem = {
  img: string;
  color: string;
};

export const programmLangIcons = new Map<string, LangItem>()
  .set('js', { img: js, color: '#FDD83C' })
  .set('cpp', { img: cpp, color: '#5E98CF' })
  .set('python', { img: python, color: 'green' });
