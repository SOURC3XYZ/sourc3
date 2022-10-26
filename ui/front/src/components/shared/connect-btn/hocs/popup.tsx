import { TelegramIcon, TwitterIcon } from '@components/shared/icons';
import { NavButton } from '@components/shared/nav-button';
import { Popup } from '@components/shared/popup';
import { SOCIAL_LINKS } from '@libs/constants';
import {
  FC, useCallback, useState
} from 'react';
import styles from './popup.module.scss';

type ButtonProps = {
  onConnect: () => void
};

export function badConnectPopup<T extends ButtonProps>(Component: FC<T>) {
  return function (props:T) {
    const [isVisible, setVisible] = useState(false);
    const { onConnect } = props;

    const handleSetVisible = useCallback(() => {
      setVisible(true);
    }, [isVisible]);

    const handleConnect = useCallback(() => {
      setVisible(false);
      setTimeout(onConnect);
    }, [onConnect]);

    return (
      <>
        <Popup
          visible={isVisible}
          title="We’re in Alpha"
          onCancel={() => (setVisible(false))}
          agree
          confirmButton={(
            <NavButton
              name="I understand"
              onClick={handleConnect}
              active
            />
          )}
        >
          <div className={styles.textWrapper}>
            <div>
              This version of the extension is currently in Alpha and may have moments of downtime. We are working on it and appreciate your patience as we build.
            </div>
            <div>
              We always appreciate your feedback.
            </div>
            <div className={styles.icons}>
              <a href={SOCIAL_LINKS.TWITTER} target="_blank" rel="noreferrer">
                <TwitterIcon className={styles.icon} />
              </a>
              <a href={SOCIAL_LINKS.TG} target="_blank" rel="noreferrer">
                <TelegramIcon className={styles.icon} />
              </a>
            </div>
          </div>
        </Popup>
        <Component {...props as T} onConnect={handleSetVisible} />
      </>
    );
  };
}
