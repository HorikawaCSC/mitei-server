import * as express from 'express';
import { config } from './config';
import { connect } from './models';
import { router as apiRouter } from './routes/api';
import { router as callbackRouter } from './routes/callback';

(async () => {
  await connect();

  const callbackApp = express();
  callbackApp.use(callbackRouter);
  callbackApp.listen(config.callbackPort);

  const app = express();
  app.use('/api', apiRouter);
  app.listen(config.appPort);
})();
