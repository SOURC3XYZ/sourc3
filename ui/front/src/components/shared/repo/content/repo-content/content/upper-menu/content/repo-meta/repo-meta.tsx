import { Info } from '@components/shared';
import { textEllipsis } from '@libs/utils';
import { BranchCommit } from '@types';
import { Col } from 'antd';
import styles from './repo-meta.module.scss';

type RepoMetaProps = {
  commit: BranchCommit;
};

function RepoMeta({ commit }: RepoMetaProps) {
  const data = [
    {
      title: 'Author: ',
      message: commit.author_name,
      link: commit.author_email
    },
    {
      title: 'Last comitter: ',
      message: commit.committer_name,
      link: commit.committer_email
    },
    {
      title: 'Commit: ',
      message: commit.raw_message,
      link: commit.raw_header
    }
  ];

  const dataRender = data.map(({ title, message, link }, i) => (
    <Col key={`repo-meta-${title}`} offset={i && 1}>
      <Info title={title} message={textEllipsis(message, 20)} link={link} />
    </Col>
  ));
  return (
    <div className={styles.meta}>
      {dataRender}
    </div>
  );
}

export default RepoMeta;
