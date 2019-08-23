import { UserDocument, ViewerDevice } from '@mitei/server-models';
import { combineResolvers } from 'apollo-resolvers';
import { ContextFunction } from 'apollo-server-core';
import { ApolloServer, gql } from 'apollo-server-express';
import { Request } from 'express';
import { readFileSync } from 'fs';
import { resolvers as apiResolvers } from '../api';
import { GqlContext } from '../api/context';
import { AuthDirective } from '../api/directives/auth';
import { DeviceDirective } from '../api/directives/device';
import { parseToken, TokenType } from '../utils/viewer/token';

const createContext: ContextFunction<{ req: Request }, GqlContext> = async ({
  req,
}) => {
  const requestAddr = req.ip;
  if (req.user) {
    return { userInfo: req.user as UserDocument, requestAddr };
  } else if (typeof req.headers['x-device-token'] === 'string') {
    const { type, deviceId } = parseToken(req.headers[
      'x-device-token'
    ] as string);
    if (type === TokenType.AuthorizedClient) {
      const device = await ViewerDevice.findById(deviceId);
      if (device) {
        return { deviceInfo: device, requestAddr };
      }
    }
  }

  return {
    requestAddr,
  };
};

const resolvers = combineResolvers([apiResolvers]);
const typeDefs = ['app', 'channel', 'schedule', 'source', 'user', 'viewer'].map(
  name =>
    gql(
      readFileSync(require.resolve(`@mitei/schema/${name}.gql`), {
        encoding: 'utf8',
      }),
    ),
);

export const gqlServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
  subscriptions: {
    path: '/gql/ws',
  },
  schemaDirectives: {
    auth: AuthDirective,
    deviceOnly: DeviceDirective,
  },
  playground: {
    tabs: [
      {
        endpoint: '/gql',
        query: '',
      },
    ],
    settings: {
      'request.credentials': 'include',
      // tslint:disable-next-line:no-any
    } as any,
  },
});
