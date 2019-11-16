import { ObjectID } from 'mongodb';
import { Document, Schema } from 'mongoose';

type RefDoc = Document & {
  [k: string]: Document;
};

type StrOnly<T> = T extends string ? T : never;

export const createRefIdVirtual = <T extends Document>(
  schema: Schema<T>,
  field: StrOnly<keyof T>,
  idField: StrOnly<keyof T>,
) => {
  schema
    .virtual(idField)
    .get(function(this: RefDoc) {
      if (this.populated(field)) {
        return (this[field] as Document)._id;
      } else {
        return this[field];
      }
    })
    .set(function(this: RefDoc, value: ObjectID) {
      if (this.populated(field)) {
        throw new Error('populated field not supported');
      } else {
        (this[field] as unknown) = value;
      }
    });
};
