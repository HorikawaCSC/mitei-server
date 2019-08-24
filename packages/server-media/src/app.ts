import { json } from 'body-parser';
import * as express from 'express';
import { connect as connectMongo } from 'mongoose';
import { resolve } from 'path';
import { config } from './config';
import { router as apiRouter } from './routes/api';
import { arenaApp } from './routes/arena';
import { router as authRouter } from './routes/auth';
import { router as callbackRouter } from './routes/callback';
import { gqlServer } from './routes/gql';
import { applyAuthenticateMiddleware } from './utils/auth';
import { connectRedis } from './utils/redis';
import { liveHlsManager } from './workers/live-hls';

(async () => {
  await connectMongo(config.mongo, { useNewUrlParser: true });
  await connectRedis();

  await liveHlsManager.cleanUpUnused();

  const callbackApp = express();
  callbackApp.use(callbackRouter);
  callbackApp.listen(config.callbackPort);

  const app = express();

  app.use(json());
  applyAuthenticateMiddleware(app);

  app.use('/auth', authRouter);
  app.use('/api', apiRouter);
  app.use('/packs', express.static(resolve('./packs')));
  if (!config.prod) {
    app.use('/', arenaApp);
  }
  const server = app.listen(config.appPort);
  gqlServer.installSubscriptionHandlers(server);
  gqlServer.applyMiddleware({ app, path: '/gql' });

  app.use('/admin/*', (_req, res) =>
    res.sendFile(resolve('./packs/admin.html')),
  );
  app.use('*', (_req, res) => res.sendFile(resolve('./packs/index.html')));
})();
