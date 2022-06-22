import { COLORS, CONFIG } from '@libs/constants';
import { useFetch } from '@libs/hooks/shared';
import { Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from './list-item.module.scss';

enum PendingStatus {
  ERROR = 'no hashes',
  IN_PIN = 'in pin',
  PINNED = 'pinned'
}

type PendingIndicatorProps = {
  id: number;
};

type RepoStatusRes = {
  title: string,
  id: number,
  pending: boolean
};

function PendingIndicator({ id }:PendingIndicatorProps) {
  const [pending, setPending] = useState<PendingStatus>(PendingStatus.ERROR);

  const url = useMemo(() => {
    const key = `pending-repo-${CONFIG.CID}-${id}`;
    return [CONFIG.IPFS_HOST, 'repo', CONFIG.NETWORK, key].join('/');
  }, []);

  const { error, data } = useFetch<RepoStatusRes>(url);

  useEffect(() => {
    if (typeof data?.pending === 'boolean') {
      setPending(data.pending ? PendingStatus.IN_PIN : PendingStatus.PINNED);
    } else setPending(PendingStatus.ERROR);
  }, [data, error]);

  const backgroundColor = useMemo(() => {
    switch (pending) {
      case PendingStatus.IN_PIN:
        return COLORS.ORANGE;
      case PendingStatus.PINNED:
        return COLORS.GREEN;
      default: return COLORS.RED;
    }
  }, [pending]);
  return (
    <Tooltip placement="top" title={pending}>
      <div className={styles.pending} style={{ backgroundColor }} />
    </Tooltip>
  );
}

export default PendingIndicator;
