import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BeamButton } from '@components/shared';
import { useSelector } from '@libs/redux';
import styles from './fail-page.module.scss';

import illustration from '../../../assets/icons/illustration2.svg';
import semisquare from '../../../assets/icons/semisquare.svg';
import circle2 from '../../../assets/icons/circle2.svg';
import square from '../../../assets/icons/square.svg';
import semisquare2 from '../../../assets/icons/semisquare2.svg';
import arrow2 from '../../../assets/icons/arrow2.svg';

type FailPageProps = {
  comeBack?: string
  resetErrState?: () => void
};

function FailPage({
  comeBack, resetErrState
}: FailPageProps) {
  const navigate = useNavigate();

  const prevRepoHref = useSelector((state) => state.repo.prevReposHref);

  useEffect(() => resetErrState);

  const back = () => {
    if (comeBack !== undefined) return navigate(comeBack);
    return navigate(prevRepoHref || '/');
  };
  return (
    <div className={styles.section}>
      <div className={styles.text}>
        <div className={styles.img}>
          <img src={illustration} alt="illustration" />
          <img src={semisquare} alt="semisquare" />
          <img src={circle2} alt="circle" />
          <img src={square} alt="square" />
          <img src={arrow2} alt="arrow" />
          <img src={semisquare2} alt="semisquare" />
        </div>

        <h1>Page not found</h1>
        <p>
          The page you are looking for was moved, removed,
          <span>renamed or never existed</span>

        </p>
        <BeamButton callback={back}>Go back home</BeamButton>
        {/* <Result */}
        {/*    status="404" */}
        {/*    title={title} */}
        {/*    subTitle={subTitle} */}
        {/*    extra={ */}
        {/*        !!isBtn && <BeamButton callback={back}>Back Home</BeamButton> */}
        {/*    } */}
        {/* /> */}
      </div>
    </div>
  );
}

export default FailPage;
