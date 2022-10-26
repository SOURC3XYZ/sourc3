import { IconCloseCross } from '@components/svg';
import { Button } from 'antd';
import React, { ReactNode, useMemo } from 'react';
import BackDrop from './backDrop';
import styles from './popup.module.scss';

interface PopupProps {
  title?: string;
  cancelButton?: React.ReactElement | null;
  confirmButton?: React.ReactElement;
  visible?: boolean;
  footer?: boolean;
  agree?: boolean;
  defaultCancel?:boolean;
  onCancel?: React.MouseEventHandler;

  children?:ReactNode;
}
function Popup({
  title,
  visible,
  defaultCancel,
  cancelButton,
  confirmButton,
  children,
  footer,
  agree = false,
  onCancel
}:PopupProps) {
  const cancelBtn = useMemo(() => cancelButton || (
    <Button onClick={onCancel}>
      Cancel
    </Button>
  ), [cancelButton]);

  const defaultCancelBtn = useMemo(() => defaultCancel && (
    <Button
      type="link"
      className={styles.buttonClose}
      onClick={onCancel}
    >
      <IconCloseCross />
    </Button>
  ), [defaultCancel]);

  return (
    (visible ? (
      <BackDrop
        onCancel={onCancel}
      >
        <div className={styles.container}>
          {defaultCancelBtn}
          <div className={styles.title}>{title}</div>

          {children}
          { footer && (
            <div
            //  agree={agree}
              className={styles.footer}
            >
              {cancelBtn}
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
