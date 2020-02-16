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
    if (!context.userInfo || context.userInfo.role !== 'admin') {
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
