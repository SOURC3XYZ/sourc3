import { BeamError } from '@types';
import { Alert, Button } from 'antd';

type ErrorAlertProps = {
  onClick: () => void,
  error: BeamError
};

function ErrorAlert({ onClick, error }:ErrorAlertProps) {
  return (
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
}

export default ErrorAlert;
