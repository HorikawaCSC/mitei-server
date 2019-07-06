import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { User, UserDocument } from './User';

export enum RtmpStatus {
  Live = 'live',
  Unused = 'unused',
}
export interface RtmpInputDocument extends Document {
  name: string;
  status: RtmpStatus;
  createdBy?: UserDocument;
  createdById: ObjectID;
  createdAt?: Date;
}

const schema = new Schema(
  {
    name: {
      type: SchemaTypes.String,
      required: true,
      default: 'input',
    },
    status: {
      type: SchemaTypes.String,
      required: true,
      enum: Object.values(RtmpStatus),
      default: RtmpStatus.Unused,
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: User,
      alias: 'createdById',
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export const RtmpInput = model<RtmpInputDocument>('RtmpInput', schema);
