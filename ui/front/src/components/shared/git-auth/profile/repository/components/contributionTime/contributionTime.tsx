import React, { useEffect, useState } from 'react';
import styles from './contributionTime.module.scss';

type ContributionTimeType = {
  firstCommit: string,
  firstPr: string,
  created: string,
  lastCommit: string,
  lastPr: string,
  pushed: string,
  update: string,
};

function ContributionTime({
  firstCommit, firstPr, created, lastCommit, lastPr, pushed, update
}:ContributionTimeType) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [lastPush, setLastPush] = useState('');

  const minTimeContr = () => {
    if (firstCommit && firstPr && firstCommit !== firstPr) {
      return firstCommit > firstPr ? setStartTime(firstPr) : setStartTime(firstCommit);
    } if (!firstCommit && !firstPr) {
      return setStartTime(created);
    } if (!firstPr && firstCommit !== created && created && firstCommit) {
      return firstCommit > created ? setStartTime(created) : setStartTime(firstCommit);
    } if (!firstCommit && firstPr !== created && created && firstPr) {
      return firstPr > created ? setStartTime(created) : setStartTime(firstPr);
    }
    return setStartTime(created);
  };
  const endTimePush = () => {
    if (pushed === update && pushed && update) {
      return setLastPush(pushed);
    } if (pushed > update && pushed && update) {
      return setLastPush(pushed);
    }
    return setLastPush(pushed);
  };

  const maxTimeContr = () => {
    if (lastCommit && lastPr && lastCommit !== lastPr) {
      return lastCommit > lastPr ? setEndTime(lastCommit) : setEndTime(lastPr);
    } if (!lastCommit && !lastPr) {
      return setEndTime(lastPush);
    } if (!lastPr && lastCommit !== lastPush && lastCommit && lastPush) {
      return lastCommit > lastPush ? setEndTime(lastCommit) : setEndTime(lastPush);
    } if (!lastCommit && lastPr !== lastPush && lastPr && lastPush) {
      return lastPr > lastPush ? setEndTime(lastPr) : setEndTime(lastPush);
    }
    return setEndTime(lastPush);
  };
  useEffect(() => {
    minTimeContr();
    endTimePush();
    maxTimeContr();
  }, []);

  return (
    <div className={styles.contribution}>
      Contribution period:
      {' '}
      <span>{startTime !== endTime && `${startTime} - `}</span>
      <span>{endTime}</span>
    </div>
  );
}

export default ContributionTime;
