import { Button } from 'antd';
import React from 'react';

interface ButtonIconProps {
  onClick?: () => void
}

function ButtonIcon() {
  return (
    <Button
      onClick={onClick}
      type="button"
    >
      <img src={icon} alt="icon" />
    </Button>
  );
}

export default ButtonIcon;
