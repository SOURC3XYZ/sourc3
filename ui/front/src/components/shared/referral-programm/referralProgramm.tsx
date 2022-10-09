import { NavButton, Preload } from '@components/shared';
import { useFetch } from '@libs/hooks/shared';
import { useSelector } from '@libs/redux';
import { classNameList } from '@libs/utils';
import { NotificationPlacement } from '@types';
import { notification } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { HOST } from '../git-auth/profile/constants';
import styles from './referralProgramm.module.scss';
import { copyRefLink, formatDate } from './utils';

type Referral = {
  user_id: number,
  github_login:string,
  created_at: string
};

type RefferalsResponce = {
  referred_by: number | null,
  referrals: Referral[]
};

function ReferralProgramm() {
  const id = useSelector((state) => state.profile.data.id);

  const token = localStorage.getItem('token');
  const { data, loading, error } = useFetch<RefferalsResponce>(`${HOST}/user/referrals`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }, true);

  const handleCopyRefLink = useCallback(() => copyRefLink(id), [id]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: 'connection failed',
        placement: 'bottomRight' as NotificationPlacement
      });
    }
  }, [error]);

  const referrals = useMemo(() => {
    if (loading) return <Preload message="loading data..." />;
    if (data) {
      return (
        <>
          {
            data.referrals.map((el) => (
              <div
                key={`user_id-${el.user_id}`}
                className={classNameList(styles.gridRow, styles.info)}
              >
                <p>{formatDate(el.created_at)}</p>
                <p>10</p>
                <p>{el.github_login}</p>
              </div>
            ))
          }
        </>
      );
    }
    return (
      <div className={styles.empty}>
        <p>No one have used your referral link so far</p>
      </div>
    );
  }, [data, loading]);

  const title = useMemo(() => {
    const count = !data?.referrals ? '...'
      : data?.referrals.length as number * 10 || 0;
    const msg = `You have ${count} referral points`;
    return <h4>{msg}</h4>;
  }, [data, loading]);

  return (
    <div className={styles.section}>
      <h1>Referral program</h1>
      <div className={styles.content}>
        <div className={styles.text}>
          {title}
          <p>Your referral score will entitle you to future benefits and airdrops. Use your SOURC3 referral link to spread the Web3 word.</p>
          <NavButton
            isDisabled={!id}
            onClick={handleCopyRefLink}
            name="Copy referral link"
          />
        </div>
        <div className={styles.table}>
          <div className={classNameList(styles.title, styles.gridRow)}>
            <h4>Activation date</h4>
            <h4>Referral points</h4>
            <h4>User</h4>
          </div>
          {referrals}
        </div>
      </div>
    </div>
  );
}
export default ReferralProgramm;
