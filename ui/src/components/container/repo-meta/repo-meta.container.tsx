import { Info } from '@components/shared';
import { RootState } from '@libs/redux';
import { RepoCommit } from '@types';
import { Col, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import styles from './repo-meta.module.css';

type RepoMetaProps = {
  commitData: RepoCommit | null;
  name: string;
};

const RepoMeta = ({ commitData, name }: RepoMetaProps) => {
  const repoName = React.useMemo(() => name, []);
  return (
    <div className={styles.meta}>
      {commitData && (
        <>
          <Col>
            <Info
              title="author: "
              message={commitData.author_name}
              link={commitData.author_email}
            />
          </Col>
          <Col>
            <Info
              title="last comitter: "
              message={commitData.committer_name}
              link={commitData.committer_email}
            />
          </Col>
          <Col>
            <Info
              title="commit: "
              message={commitData.raw_message}
              link={commitData.raw_header}
            />
          </Col>
        </>
      )}
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

const mapState = ({ repo: { commitData } }: RootState) => ({
  commitData
});

export default connect(mapState)(RepoMeta);
