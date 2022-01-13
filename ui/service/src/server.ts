import { PORT } from './common/config';
import app from './app';
import { resToBeamApi } from './resources/beam-api/beam.service';

const obj = {
  jsonrpc: '2.0',
  id: 1,
  method: 'get_version'
};

resToBeamApi(obj).then((data: any) => {
  if (typeof data === 'object') {
    console.log('connected to wallet api');
    app.listen(PORT || 5001, () => console.log(
      `App is running on http://localhost:${PORT}`
    ));
  }
});
