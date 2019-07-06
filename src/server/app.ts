import { json } from 'body-parser';
import * as createMongoSessionStore from 'connect-mongo';
import * as express from 'express';
import * as session from 'express-session';
import { connect } from 'mongoose';
import * as passport from 'passport';
import { resolve } from 'path';
import { config } from './config';
import { router as apiRouter } from './routes/api';
import { router as authRouter } from './routes/auth';
import { router as callbackRouter } from './routes/callback';
import { gqlServer } from './routes/gql';

(async () => {
  const { connection } = await connect(
    config.mongo,
    { useNewUrlParser: true },
  );

  const callbackApp = express();
  callbackApp.use(callbackRouter);
  callbackApp.listen(config.callbackPort);

  const app = express();

  const MongoStore = createMongoSessionStore(session);

  app.use(json());
  app.use(
    session({
      secret: config.secrets.session,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: connection }),
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
