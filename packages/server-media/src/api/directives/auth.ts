import { AuthenticationError } from 'apollo-server-core';
import {
  defaultFieldResolver,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from 'graphql';
import { SchemaDirectiveVisitor } from 'graphql-tools';
import { UserKind } from '../../generated/graphql';
import { GqlContext } from '../context';

interface AuthObjectType extends GraphQLObjectType {
  _requiredAuthRole: UserKind[];
  _authFieldsWrapped: boolean;
}

interface AuthInterfaceType extends GraphQLInterfaceType {
  _requiredAuthRole: UserKind[];
  _authFieldsWrapped: boolean;
}

interface AuthField extends GraphQLField<unknown, unknown> {
  _requiredAuthRole: UserKind[];
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
        if (!user || !requiredRole.includes(user.kind)) {
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
          if (!user || !requiredRole.includes(user.kind)) {
            throw new AuthenticationError('not authorized');
          }

          return subscribe.apply(this, args);
        };
      }
    });
  }
}
