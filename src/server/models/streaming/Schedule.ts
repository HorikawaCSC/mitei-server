import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import {
  TranscodedSource,
  TranscodedSourceDocument,
} from '../TranscodedSource';
import { User, UserDocument } from '../User';
import { Channel, ChannelDocument } from './Channel';

export interface ScheduleDocument extends Document {
  startAt: Date;
  endAt: Date;
  channel?: ChannelDocument;
  channelId: string;
  // primary, secondary, ...
  sources?: TranscodedSourceDocument[];
  sourceIds: ObjectID[];
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
    sources: {
      type: [SchemaTypes.ObjectId],
      ref: TranscodedSource,
      required: true,
      alias: 'sourceIds',
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
