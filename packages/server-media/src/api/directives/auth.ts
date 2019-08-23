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
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
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
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function(...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole =
          field._requiredAuthRole || objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const context = args[2] as GqlContext;
        const user = context.userInfo;
        if (!user || !requiredRole.includes(user.kind)) {
          throw new Error('not authorized');
        }

        return resolve.apply(this, args);
      };
    });
  }
}
