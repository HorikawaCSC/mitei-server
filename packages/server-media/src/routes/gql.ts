import { UserDocument } from '@mitei/server-models';
import { combineResolvers } from 'apollo-resolvers';
import { ContextFunction } from 'apollo-server-core';
import { ApolloServer, gql } from 'apollo-server-express';
import { Request } from 'express';
import { readFileSync } from 'fs';
import { resolvers as apiResolvers } from '../api';
import { GqlContext } from '../api/context';

const createContext: ContextFunction<{ req: Request }, GqlContext> = ({
  req,
}) => {
  const requestAddr = req.ip;
  if (req.user) {
    return { userInfo: req.user as UserDocument, requestAddr };
  } else {
    return {
      requestAddr,
    };
  }
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
