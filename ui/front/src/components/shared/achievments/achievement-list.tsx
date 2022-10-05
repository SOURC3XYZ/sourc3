import Achievment from './achievement';
import styles from './achievements.module.scss';
import { programmLangIcons } from './prog-lang-list';

const data = [
  {
    type: 'js',
    params: {
      name: 'JavaScript',
      lines: 2222,
      commits: 2222,
      hours: 222,
      releases: 23423,
      pullRequests: 234
    }
  },
  {
    type: 'cpp',
    params: {
      name: 'C++',
      lines: 1000,
      commits: 29,
      hours: 10000,
      releases: 23,
      pullRequests: 80
    }
  },
  {
    type: 'python',
    params: {
      name: 'Python',
      lines: 100,
      commits: 2,
      hours: 100,
      releases: 0,
      pullRequests: 0
    }
  }
];

function AchievementList() {
  return (
    <div className={styles.wrapper}>
      {data.map((el) => {
        const item = programmLangIcons.get(el.type);
        if (item) {
          return <Achievment key={el.type} img={item.img} color={item.color} params={el.params} />;
        }
        return null;
      })}
    </div>
  );
}

export default AchievementList;
