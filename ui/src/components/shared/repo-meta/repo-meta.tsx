import { Info } from '@components/shared';
import { BranchCommit } from '@types';
import { Col, Typography } from 'antd';
import React from 'react';
import styles from './repo-meta.module.css';

type RepoMetaProps = {
  commit: BranchCommit;
  name: string;
};

const RepoMeta = ({ commit, name }: RepoMetaProps) => {
  const repoName = React.useMemo(() => name, []);
  return (
    <div className={styles.meta}>
      <Col>
        <Info
          title="author: "
          message={commit.author_name}
          link={commit.author_email}
        />
      </Col>
      <Col>
        <Info
          title="last comitter: "
          message={commit.committer_name}
          link={commit.committer_email}
        />
      </Col>
      <Col>
        <Info
          title="commit: "
          message={commit.raw_message}
          link={commit.raw_header}
        />
      </Col>
      <Col>
        <Typography.Text
          type="success"
          copyable={{ text: `pit://${repoName}` }}
        >
          {repoName}
        </Typography.Text>
      </Col>
    </div>
  );
};

export default RepoMeta;
