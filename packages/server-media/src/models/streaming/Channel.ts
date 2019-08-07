import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import {
  TranscodedSource,
  TranscodedSourceDocument,
} from '../TranscodedSource';
import { User, UserDocument } from '../User';

export enum FillerControl {
  Sequential = 'sequential',
  Random = 'random',
}

export interface ChannelDocument extends Document {
  _id: string;
  displayName: string;
  createdBy?: UserDocument;
  createdById: ObjectID;
  fillerSources: TranscodedSourceDocument[];
  fillerSourceIds: ObjectID[];
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

export const Channel = model<ChannelDocument>('Channel', schema);
