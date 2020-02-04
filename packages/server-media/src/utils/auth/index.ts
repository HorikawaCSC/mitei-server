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

import { connection } from '@mitei/server-models';
import * as createMongoSessionStore from 'connect-mongo';
import {
  Application,
  Handler,
  Request,
  request as requestProto,
} from 'express';
import * as session from 'express-session';
import { IncomingMessage } from 'http';
import * as passport from 'passport';
import { config } from '../../config';

const MongoStore = createMongoSessionStore(session);

let middlewares: Handler[] | null = null;
let app: Application | null = null;
export const applyAuthenticateMiddleware = (target: Application) => {
  if (middlewares) return;
  (app = target).use(
    ...(middlewares = [
      session({
        secret: config.secrets.session,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: connection }),
      }),
      passport.initialize(),
      passport.session(),
    ]),
  );
};

export const authenticateWebSocket = async (request: IncomingMessage) => {
  if (!middlewares) throw new Error('not initialized');

  Object.defineProperty(request, 'app', {
    get() {
      return app;
    },
  });
  Object.setPrototypeOf(request, Object.create(requestProto));
  await middlewares.reduce((prev, handler) => {
    return prev.then(req => {
      return new Promise((resolve, reject) => {
        // tslint:disable-next-line: no-any
        handler(req, {} as any, err => (err ? reject(err) : resolve(req)));
      });
    });
  }, Promise.resolve(request as Request));
};
