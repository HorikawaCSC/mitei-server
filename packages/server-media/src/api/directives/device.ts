import { AuthenticationError } from 'apollo-server-core';
import {
  defaultFieldResolver,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from 'graphql';
import { SchemaDirectiveVisitor } from 'graphql-tools';
import { GqlContext } from '../context';

interface DeviceObjectType extends GraphQLObjectType {
  _deviceFieldsWrapped: boolean;
}

interface DeviceInterfaceType extends GraphQLInterfaceType {
  _deviceFieldsWrapped: boolean;
}

interface DeviceField extends GraphQLField<unknown, unknown> {
  _deviceFieldsWrapped: boolean;
}

export class DeviceDirective extends SchemaDirectiveVisitor {
  visitObject(type: DeviceObjectType) {
    this.ensureFieldsWrapped(type);
  }
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(
    _field: DeviceField,
    details: {
      objectType: DeviceObjectType | DeviceInterfaceType;
    },
  ) {
    this.ensureFieldsWrapped(details.objectType);
  }

  private ensureFieldsWrapped(
    objectType: DeviceObjectType | DeviceInterfaceType,
  ) {
    if (objectType._deviceFieldsWrapped) return;
    objectType._deviceFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName] as DeviceField;
      const { resolve = defaultFieldResolver, subscribe } = field;

      field.resolve = async function(...args) {
        const context = args[2] as GqlContext;
        const device = context.deviceInfo;
        if (!device) {
          throw new AuthenticationError('not authorized device');
        }

        return resolve.apply(this, args);
      };
      if (subscribe) {
        field.subscribe = async function(...args) {
          const context = args[2] as GqlContext;
          const device = context.deviceInfo;
          if (!device) {
            throw new AuthenticationError('not authorized device');
          }

          return subscribe.apply(this, args);
        };
      }
    });
  }
}
