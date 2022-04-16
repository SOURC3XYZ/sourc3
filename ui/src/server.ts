import { PORT } from './common/config';
import { expressApp } from './app';
import { tryBDConnect } from './utils/typeorm-handler';

const port = PORT || 6666;

tryBDConnect(() => {
  expressApp.listen(port, () => console.log(
    `App is running on http://localhost:${port}`
  ));
});
