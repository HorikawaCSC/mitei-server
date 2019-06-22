import { GqlContext } from '../../api/context';
import { ResolverFn } from '../../generated/graphql';
import { User } from '../../models/User';

type LoggedInContext = Omit<GqlContext, 'userInfo'> & { userInfo: User };
export const ensureLoggedInAsAdmin = <TResult, TParent = {}, TArgs = {}>(
  input: ResolverFn<TResult, TParent, LoggedInContext, TArgs>,
): ResolverFn<TResult, TParent, GqlContext, TArgs> => {
  return (parent, args, context, info) => {
    if (!context.userInfo || context.userInfo.kind !== 'admin') {
      throw new Error('not authorized');
    }

    return input(parent, args, context as LoggedInContext, info);
  };
};

export const ensureLoggedIn = <TResult, TParent = {}, TArgs = {}>(
  input: ResolverFn<TResult, TParent, LoggedInContext, TArgs>,
): ResolverFn<TResult, TParent, GqlContext, TArgs> => {
  return (parent, args, context, info) => {
    if (!context.userInfo) {
      throw new Error('not authorized');
    }

    return input(parent, args, context as LoggedInContext, info);
  };
};
