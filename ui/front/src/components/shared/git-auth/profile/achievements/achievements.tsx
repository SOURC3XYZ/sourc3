import React from 'react';
import { IAchievements } from '@types';
import { Achievements } from '@components/shared';

type AchievementsProps = {
  achievements: IAchievements[];
};

function AchievementsContainer({ achievements }:AchievementsProps) {
  console.log('ACHIVKI', achievements);
  return (
    <Achievements
      params={{
        name: '',
        commits: 0,
        lines: 0,
        hours: 0,
        releases: 0,
        pullRequests: 0
      }}
      color=""
      img=""
    />
  );
}

export default AchievementsContainer;
