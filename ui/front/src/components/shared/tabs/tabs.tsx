/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import classJoin from 'classnames';
import styles from './tabs.module.scss';

type Tab = {
  id: number,
  label: string
};

type PropClasses = {
  root?: string,
  tab?: string,
  selectedTabs?: string,
  label?: string,
  selectedLabel?: string
};

type TabsProps = {
  classNames?: PropClasses,
  selectedId: number,
  tabs: Tab[],
  onClick: (id:number) => void
};

function Tabs({
  classNames = {},
  selectedId,
  tabs,
  onClick
}:TabsProps) {
  const propsClasses = {
    root: styles.Tabs,
    tab: styles.Tab,
    selectedTabs: styles.Tab__selected,
    label: styles.TabsLabel,
    selectedLabel: styles.TabLabel__selected,
    ...classNames
  };

  return (
    <div className={classJoin(styles.Tabs, propsClasses.root)}>
      {tabs && tabs.map((tab) => (
        <div
          className={classJoin(propsClasses.tab, {
            [propsClasses.selectedTabs]: tab.id === selectedId
          })}
          key={tab.id}
          onClick={() => onClick(tab.id)}
        >
          <div
            className={classJoin(propsClasses.label, {
              [propsClasses.selectedLabel]: tab.id === selectedId
            })}
          >
            {tab.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Tabs;
