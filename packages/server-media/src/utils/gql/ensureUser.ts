import { UserDocument } from '@mitei/server-models';
import { AuthenticationError } from 'apollo-server-core';
import { GqlContext } from '../../api/context';
import { ResolverFn } from '../../generated/graphql';

type LoggedInContext = Omit<GqlContext, 'userInfo'> & {
  userInfo: UserDocument;
};
export const ensureLoggedInAsAdmin = <TResult, TParent = {}, TArgs = {}>(
  input: ResolverFn<TResult, TParent, LoggedInContext, TArgs>,
): ResolverFn<TResult, TParent, GqlContext, TArgs> => {
  return (parent, args, context, info) => {
    if (!context.userInfo || context.userInfo.kind !== 'admin') {
      throw new AuthenticationError('you do not have admin perm');
    }

    return input(parent, args, context as LoggedInContext, info);
  };
};

export const ensureLoggedIn = <TResult, TParent = {}, TArgs = {}>(
  input: ResolverFn<TResult, TParent, LoggedInContext, TArgs>,
): ResolverFn<TResult, TParent, GqlContext, TArgs> => {
  return (parent, args, context, info) => {
    if (!context.userInfo) {
      throw new AuthenticationError('you need to log in');
    }

    return input(parent, args, context as LoggedInContext, info);
  };
};
