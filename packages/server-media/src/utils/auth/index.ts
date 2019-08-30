import * as createMongoSessionStore from 'connect-mongo';
import {
  Application,
  Handler,
  Request,
  request as requestProto,
} from 'express';
import * as session from 'express-session';
import { IncomingMessage } from 'http';
import { connection } from 'mongoose';
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
