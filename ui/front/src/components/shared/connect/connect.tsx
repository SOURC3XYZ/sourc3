import { Button } from 'antd';
import { useConnectFromDesktop } from './useConnectFromDesktop';

function Connect() {
  const [, ping] = useConnectFromDesktop();

  return (
    <div>
      connect wallet
      <Button onClick={ping}>
        CLICK ME
      </Button>
    </div>
  );
}

export default Connect;
