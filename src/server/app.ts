import * as express from 'express';
import { router as callbackRouter } from './api/callback';
import { config } from './config';
import { connect } from './models';

(async () => {
  await connect();

  const callbackApp = express();
  callbackApp.use(callbackRouter);
  callbackApp.listen(config.callbackPort);
})();
