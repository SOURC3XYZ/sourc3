import React from 'react';
import styles from './pullRequest.module.scss';

type PullRequestsType = {
  total: number,
  accepted: number,
  pending: number,
  rejected :number
};

function PullRequests({
  pending, accepted, rejected, total
}:PullRequestsType) {
  return (
    <div className={styles.wrapper}>
      <span>
        {`PRs: Total: ${total}
          `}
      </span>
      <span>
        {`Accepted: ${accepted}
          `}
      </span>
      <span>
        {`Pending: ${pending}
          `}
      </span>
      <span>
        {`Rejected: ${rejected}
          `}
      </span>
    </div>
  );
}

export default PullRequests;
