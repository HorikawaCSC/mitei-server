import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { User, UserDocument } from '../User';
import { SourceReference, sourceReferenceSchema } from './SourceReference';

export enum FillerControl {
  Sequential = 'sequential',
  Random = 'random',
}

export interface ChannelDocument extends Document {
  _id: string;
  displayName: string;
  createdBy?: UserDocument;
  createdById: ObjectID;
  fillerSources: SourceReference[];
  fillerControl: FillerControl;
}

const schema = new Schema(
  {
    _id: {
      type: SchemaTypes.String,
      required: true,
    },
    displayName: {
      type: SchemaTypes.String,
      required: true,
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      ref: User,
      required: true,
      alias: 'createdById',
    },
    fillerSources: {
      type: [sourceReferenceSchema('fillerSources')],
      required: true,
    },
    fillerControl: {
      type: SchemaTypes.String,
      enum: Object.values(FillerControl),
      required: true,
      default: FillerControl.Random,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export const Channel = model<ChannelDocument>('Channel', schema);
