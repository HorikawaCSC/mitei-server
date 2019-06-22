import { json } from 'body-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import { resolve } from 'path';
import { getConnection } from 'typeorm';
import { TypeormStore } from 'typeorm-store';
import { config } from './config';
import { connect } from './models';
import { Session } from './models/Session';
import { router as apiRouter } from './routes/api';
import { router as authRouter } from './routes/auth';
import { router as callbackRouter } from './routes/callback';
import { gqlServer } from './routes/gql';

(async () => {
  await connect();

  const callbackApp = express();
  callbackApp.use(callbackRouter);
  callbackApp.listen(config.callbackPort);

  const app = express();

  const store = new TypeormStore({
    repository: getConnection().getRepository(Session),
  });

  app.use(json());
  app.use(
    session({
      secret: config.secrets.session,
      resave: false,
      saveUninitialized: false,
      store,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/auth', authRouter);
  app.use('/api', apiRouter);
  app.use('/packs', express.static(resolve('./packs')));
  const server = app.listen(config.appPort);
  gqlServer.installSubscriptionHandlers(server);
  gqlServer.applyMiddleware({ app, path: '/gql' });

  app.use('/admin/*', (_req, res) =>
    res.sendFile(resolve('./packs/admin.html')),
  );
  app.use('*', (_req, res) => res.sendFile(resolve('./packs/index.html')));
})();
