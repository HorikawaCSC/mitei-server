import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { RtmpInputDocument } from '../RtmpInput';
import { TranscodedSourceDocument } from '../TranscodedSource';
import { User, UserDocument } from '../User';
import { Channel, ChannelDocument } from './Channel';

export enum SourceRefType {
  RtmpInput = 'RtmpInput',
  TranscodedSource = 'TranscodedSource',
}

export interface ScheduleDocument extends Document {
  startAt: Date;
  endAt: Date;
  channel?: ChannelDocument;
  channelId: string;
  source?: TranscodedSourceDocument | RtmpInputDocument;
  sourceType: SourceRefType;
  createdBy?: UserDocument;
  createdById: ObjectID;
}

const schema = new Schema(
  {
    startAt: {
      type: SchemaTypes.Date,
      required: true,
    },
    endAt: {
      type: SchemaTypes.Date,
      required: true,
    },
    channel: {
      type: SchemaTypes.String,
      ref: Channel,
      required: true,
      alias: 'channelId',
    },
    source: {
      type: SchemaTypes.ObjectId,
      refPath: 'sourceType',
      alias: 'sourceId',
    },
    sourceType: {
      type: SchemaTypes.String,
      enum: Object.values(SourceRefType),
      default: SourceRefType.TranscodedSource,
      required: true,
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      ref: User,
      required: true,
      alias: 'createdById',
    },
  },
  {
    timestamps: true,
  },
);

export const Schedule = model<ScheduleDocument>('Schedule', schema);
