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

import { AuthenticationError } from 'apollo-server-core';
import { SchemaDirectiveVisitor } from 'apollo-server-express';
import {
  defaultFieldResolver,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from 'graphql';
import { UserRole } from '../../generated/graphql';
import { GqlContext } from '../context';

interface AuthObjectType extends GraphQLObjectType {
  _requiredAuthRole: UserRole[];
  _authFieldsWrapped: boolean;
}

interface AuthInterfaceType extends GraphQLInterfaceType {
  _requiredAuthRole: UserRole[];
  _authFieldsWrapped: boolean;
}

interface AuthField extends GraphQLField<unknown, unknown> {
  _requiredAuthRole: UserRole[];
  _authFieldsWrapped: boolean;
}

export class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type: AuthObjectType) {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }

  visitFieldDefinition(
    field: AuthField,
    details: {
      objectType: AuthObjectType | AuthInterfaceType;
    },
  ) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  private ensureFieldsWrapped(objectType: AuthObjectType | AuthInterfaceType) {
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName] as AuthField;
      const { resolve = defaultFieldResolver, subscribe } = field;
      field.resolve = async function(...args) {
        const requiredRole =
          field._requiredAuthRole || objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const context = args[2] as GqlContext;
        const user = context.userInfo;
        if (!user || !requiredRole.includes(user.role)) {
          throw new AuthenticationError('not authorized');
        }

        return resolve.apply(this, args);
      };
      if (subscribe) {
        field.subscribe = async function(...args) {
          const requiredRole =
            field._requiredAuthRole || objectType._requiredAuthRole;

          if (!requiredRole) {
            return subscribe.apply(this, args);
          }

          const context = args[2] as GqlContext;
          const user = context.userInfo;
          if (!user || !requiredRole.includes(user.role)) {
            throw new AuthenticationError('not authorized');
          }

          return subscribe.apply(this, args);
        };
      }
    });
  }
}
