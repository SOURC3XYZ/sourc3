import { PORT } from './common/config';
import app from './app';

// const obj = {
//   jsonrpc: '2.0',
//   id: 1,
//   method: 'get_version'
// };

const port = PORT || 666;

app.listen(port, () => console.log(
  `App is running on http://localhost:${port}`
));
