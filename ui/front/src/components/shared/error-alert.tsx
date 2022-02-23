import { BeamError } from '@types';
import { Alert, Button } from 'antd';
import React from 'react';

type ErrorAlertProps = {
  onClick: () => void,
  error: BeamError
};

const ErrorAlert:React.FC<ErrorAlertProps> = ({ onClick, error }) => (
  <Alert
    message="Error Text"
    showIcon
    description={error.message}
    type="error"
    action={(
      <Button onClick={onClick} size="small" type="default">
        Reload
      </Button>
    )}
  />
);

export default ErrorAlert;
