import { IconCloseCross } from '@components/svg';
import { Button } from 'antd';
import React, { ReactNode } from 'react';
import BackDrop from './backDrop';
import styles from './popup.module.scss';

interface PopupProps {
  title?: string;
  cancelButton?: React.ReactElement;
  confirmButton?: React.ReactElement;
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
  //   footerClass?: string;
  footer?: boolean;
  agree?: boolean;
  //   closeButton?: boolean;
  children?:ReactNode;
}
function Popup({
  title,
  visible,
  onCancel,
  cancelButton = (
    <Button onClick={onCancel}>
      Cancel
    </Button>
  ),
  confirmButton,
  children,
  //   footerClass,
  footer,
  //   closeButton = false,
  agree = false
}:PopupProps) {
  return (
    (visible ? (
      <BackDrop
        onCancel={onCancel}
      >
        <div className={styles.container}>
          <Button
            type="link"
            className={styles.buttonClose}
            onClick={onCancel}
          >
            <IconCloseCross />
          </Button>
          <div className={styles.title}>{title}</div>

          {children}
          { footer && (
            <div
            //  agree={agree}
              className={styles.footer}
            >
              {cancelButton}
              {confirmButton}
            </div>
          )}
          {agree && (
            <div className={styles.center}>
              {confirmButton}
            </div>
          )}
        </div>
      </BackDrop>
    ) : null)
  );
}

export default Popup;
