import { combineResolvers } from 'apollo-resolvers';
import { ContextFunction } from 'apollo-server-core';
import { ApolloServer, gql } from 'apollo-server-express';
import { Request } from 'express';
import { readFileSync } from 'fs';
import { resolvers as apiResolvers } from '../api';
import { GqlContext } from '../api/context';
import { UserDocument } from '../models/User';

const createContext: ContextFunction<{ req: Request }, GqlContext> = ({
  req,
}) => {
  if (req.user) {
    return { userInfo: req.user as UserDocument };
  } else {
    return {};
  }
};

const resolvers = combineResolvers([apiResolvers]);
export const gqlServer = new ApolloServer({
  typeDefs: gql(
    readFileSync(require.resolve('@mitei/schema/app.gql'), {
      encoding: 'utf8',
    }),
  ),
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
