import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { User, UserDocument } from './User';

export interface TranscodePresetDocument extends Document {
  _id: ObjectID;
  name: string;
  createdBy?: UserDocument;
  createdById: ObjectID;
  parameter: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema(
  {
    name: {
      type: SchemaTypes.String,
      required: true,
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      ref: User,
      required: true,
      alias: 'createdById',
    },
    parameter: {
      type: [SchemaTypes.String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const TranscodePreset = model<TranscodePresetDocument>(
  'TranscodePreset',
  schema,
);
