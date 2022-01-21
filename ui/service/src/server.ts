import { PORT } from './common/config';
import app from './app';

// const obj = {
//   jsonrpc: '2.0',
//   id: 1,
//   method: 'get_version'
// };

app.listen(PORT || 5001, () => console.log(
  `App is running on http://localhost:${PORT}`
));
