/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

import { connect as connectMongo } from '@mitei/server-models';
import { json } from 'body-parser';
import * as express from 'express';
import { config } from './config';
import { router as apiRouter } from './routes/api';
import { arenaApp } from './routes/arena';
import { router as authRouter } from './routes/auth';
import { router as callbackRouter } from './routes/callback';
import { router as frontendRouter } from './routes/frontend';
import { gqlServer } from './routes/gql';
import { applyAuthenticateMiddleware } from './utils/auth';
import { connectRedis } from './utils/redis';

(async () => {
  await connectMongo(config.mongo, { useNewUrlParser: true });
  await connectRedis();

  const callbackApp = express();
  callbackApp.use(callbackRouter);
  callbackApp.listen(config.callbackPort);

  const app = express();

  app.use(json());
  applyAuthenticateMiddleware(app);

  app.use('/auth', authRouter);
  app.use('/api', apiRouter);
  if (!config.prod) {
    app.use('/', arenaApp);
  }
  const server = app.listen(config.appPort);
  gqlServer.installSubscriptionHandlers(server);
  gqlServer.applyMiddleware({ app, path: '/gql' });

  app.use(frontendRouter);
})();
