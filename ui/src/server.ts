import { PORT } from './common/config';
import app from './app';
import { tryBDConnect } from './utils/typeorm-handler';
import { loggerLevel } from './middlewares';

const port = PORT || 6666;

tryBDConnect(() => {
  app.listen(port, () => loggerLevel(
    'info',
    `App is running on http://localhost:${port}`
  ));
});
