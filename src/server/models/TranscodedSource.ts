import { ObjectID } from 'bson';
import { Document, SchemaDefinition, SchemaTypes } from 'mongoose';
import { User, UserDocument } from './User';

export enum TranscodeStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
}

// offset size duration date
export type Manifest = [number, number, number, number | undefined];

export interface TranscodedSourceDocumentBase extends Document {
  createdById: ObjectID;
  createdBy?: UserDocument;
  status: TranscodeStatus;
  name: string;
  manifest: Manifest[];
  duration?: number;
  thumbnailPath?: string;
  width?: number;
  height?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const transcodedSourceSchemaBase: SchemaDefinition = {
  createdBy: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: User,
    alias: 'createdById',
  },
  name: {
    type: SchemaTypes.String,
    required: true,
    default: '',
  },
  status: {
    type: SchemaTypes.String,
    required: true,
    default: TranscodeStatus.Pending,
  },
  manifest: {
    type: [SchemaTypes.Array],
    required: true,
    default: [],
  },
  duration: SchemaTypes.Number,
  thumbnailPath: SchemaTypes.String,
  width: SchemaTypes.Number,
  height: SchemaTypes.Number,
};
