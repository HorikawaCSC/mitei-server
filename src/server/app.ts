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

(async () => {
  await connect();

  const callbackApp = express();
  callbackApp.use(callbackRouter);
  callbackApp.listen(config.callbackPort);

  const app = express();

  const store = new TypeormStore({
    repository: getConnection().getRepository(Session),
  });

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
  app.use('/admin/*', (_req, res) => res.sendFile(resolve('./packs/admin.html')));
  app.use('*', (_req, res) => res.sendFile(resolve('./packs/index.html')));
  app.listen(config.appPort);
})();
