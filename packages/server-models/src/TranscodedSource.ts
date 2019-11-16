import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { TranscodePreset, TranscodePresetDocument } from './TranscodePreset';
import { User, UserDocument } from './User';
import { createRefIdVirtual } from './utils/schema';

export enum TranscodeStatus {
  Pending = 'pending',
  Running = 'running',
  Waiting = 'waiting',
  Success = 'success',
  Failed = 'failed',
}

export enum SourceType {
  File = 'file',
  Record = 'record',
}

// offset size duration date
export type Manifest = [number, number, number, number | undefined];

export interface TranscodedSourceDocument extends Document {
  createdById: ObjectID;
  createdBy?: UserDocument;
  status: TranscodeStatus;
  name: string;
  manifest: Manifest[];
  duration?: number;
  thumbnailPath?: string;
  width?: number;
  height?: number;
  presetId?: ObjectID;
  preset?: TranscodePresetDocument;
  createdAt?: Date;
  updatedAt?: Date;
  type: SourceType;
}

const schema = new Schema(
  {
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: User,
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
    preset: {
      type: SchemaTypes.ObjectId,
      ref: TranscodePreset,
    },
    duration: SchemaTypes.Number,
    thumbnailPath: SchemaTypes.String,
    width: SchemaTypes.Number,
    height: SchemaTypes.Number,
  },
  {
    timestamps: true,
    discriminatorKey: 'type',
  },
);

createRefIdVirtual(schema, 'createdBy', 'createdById');
createRefIdVirtual(schema, 'preset', 'presetId');

export const TranscodedSource = model<TranscodedSourceDocument>(
  'TranscodedSource',
  schema,
);
