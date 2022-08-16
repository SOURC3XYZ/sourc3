import { useSourc3Api } from '@components/context';
import { CONFIG } from '@libs/constants';
import { Button } from 'antd';
import { useCallback } from 'react';

function ConnectDesktop() {
  const { callCustomIPC } = useSourc3Api();

  const onWindowOpen = () => window.open(CONFIG.SELF, '_blank');

  const sendWs = useCallback(() => callCustomIPC && callCustomIPC('ws-send'), [callCustomIPC]);

  return (
    <div style={{ display: 'flex' }}>
      <Button onClick={onWindowOpen}>
        CLICK ME
      </Button>
      <Button onClick={sendWs}>
        WS SEND
      </Button>
    </div>
  );
}

export default ConnectDesktop;
