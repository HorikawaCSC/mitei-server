import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import {
  TranscodedSource,
  TranscodedSourceDocument,
} from '../TranscodedSource';
import { User, UserDocument } from '../User';
import { createRefIdVirtual } from '../utils/schema';

export enum FillerControl {
  Sequential = 'sequential',
  Random = 'random',
}

export enum ChannelPermission {
  Public = 'public',
  ViewerOnly = 'viewerOnly',
}

export interface ChannelDocument extends Document {
  _id: string;
  displayName: string;
  createdBy?: UserDocument;
  createdById: ObjectID;
  fillerSources: TranscodedSourceDocument[];
  fillerSourceIds: ObjectID[];
  fillerControl: FillerControl;
  permission: ChannelPermission;
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
    },
    fillerSources: [
      {
        type: SchemaTypes.ObjectId,
        required: true,
        ref: TranscodedSource,
      },
    ],
    fillerControl: {
      type: SchemaTypes.String,
      enum: Object.values(FillerControl),
      required: true,
      default: FillerControl.Random,
    },
    permission: {
      type: SchemaTypes.String,
      enum: Object.values(ChannelPermission),
      required: true,
      default: ChannelPermission.ViewerOnly,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

schema
  .virtual('fillerSourceIds')
  .get(function(this: ChannelDocument): ObjectID[] {
    if (this.populated('fillerSources')) {
      return this.fillerSources.map(source => source._id);
    } else {
      return (this.fillerSources as unknown) as ObjectID[];
    }
  })
  .set(function(this: ChannelDocument, value: ObjectID[]) {
    if (this.populated('fillerSources')) {
      throw new Error('populated field not supported');
    } else {
      (this.fillerSources as unknown) = value;
    }
  });

createRefIdVirtual(schema, 'createdBy', 'createdById');

export const Channel = model<ChannelDocument>('Channel', schema);
