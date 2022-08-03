import { Footer as AntFooter } from 'antd/lib/layout/layout';
import discordIcon from '@assets/icons/discordIcon.svg';
import twitterIcon from '@assets/icons/twitterIcon.svg';
import { useMemo } from 'react';
import { useExcludeRoute } from '@libs/hooks/shared';
import styles from '../app.module.scss';

type FooterProps = {
  isOnLending: boolean
};

function Footer({ isOnLending }: FooterProps) {
  const footerClassname = isOnLending ? styles.footer : styles.footerWhiteBg;

  const isVisible = useExcludeRoute('/download', '/404');

  const SOCIAL = {
    DISCORD: 'https://discord.com/invite/Fw3Wvqt42b',
    TWITTER: 'https://twitter.com/SOURC3xyz',
    SOURC3: 'https://www.sourc3.xyz'
  };

  const footer = useMemo(() => (isVisible ? (
    <AntFooter className={footerClassname}>
      <div className={styles.content}>
        <div className={styles.icons}>
          <a href={SOCIAL.DISCORD} target="_blank">
            <img src={discordIcon} alt="discordIcon" />
          </a>
          <a href={SOCIAL.TWITTER} target="_blank">
            <img src={twitterIcon} alt="twitter" />
          </a>
        </div>
        <div className={styles.item}>
          <a href="mailto:Hello@SOURC3.xyz">
            <h4>Contact us</h4>
          </a>
          <a href={SOCIAL.SOURC3} target="_blank" rel="noreferrer">
            <h4>© Sourc3</h4>
          </a>
        </div>
        {/* <h4>© 2022 by SOURC3</h4> */}
      </div>
    </AntFooter>
  ) : null), [isOnLending, isVisible]);

  return footer;
}

export default Footer;
