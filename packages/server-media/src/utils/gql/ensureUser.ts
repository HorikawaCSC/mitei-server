import { UserDocument, ViewerDeviceDocument } from '@mitei/server-models';
import { AuthenticationError } from 'apollo-server-core';
import { GqlContext } from '../../api/context';
import { ResolverFn } from '../../generated/graphql';

type UserLoggedInContext = Omit<GqlContext, 'userInfo'> & {
  userInfo: UserDocument;
};

type DeviceContext = Omit<GqlContext, 'deviceInfo'> & {
  deviceInfo: ViewerDeviceDocument;
};

export const ensureLoggedInAsAdmin = <TResult, TParent = {}, TArgs = {}>(
  input: ResolverFn<TResult, TParent, UserLoggedInContext, TArgs>,
): ResolverFn<TResult, TParent, GqlContext, TArgs> => {
  return (parent, args, context, info) => {
    if (!context.userInfo || context.userInfo.kind !== 'admin') {
      throw new AuthenticationError('you do not have admin perm');
    }

    return input(parent, args, context as UserLoggedInContext, info);
  };
};

export const ensureLoggedIn = <TResult, TParent = {}, TArgs = {}>(
  input: ResolverFn<TResult, TParent, UserLoggedInContext, TArgs>,
): ResolverFn<TResult, TParent, GqlContext, TArgs> => {
  return (parent, args, context, info) => {
    if (!context.userInfo) {
      throw new AuthenticationError('you need to log in');
    }

    return input(parent, args, context as UserLoggedInContext, info);
  };
};

export const ensureDeviceUsed = <TResult, TParent = {}, TArgs = {}>(
  input: ResolverFn<TResult, TParent, DeviceContext, TArgs>,
): ResolverFn<TResult, TParent, GqlContext, TArgs> => {
  return (parent, args, context, info) => {
    if (!context.deviceInfo) {
      throw new AuthenticationError('you need to log in');
    }

    return input(parent, args, context as DeviceContext, info);
  };
};
