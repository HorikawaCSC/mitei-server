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

interface ScheduleDocumentBase {
  startAt: Date;
  endAt: Date;
  channel?: ChannelDocument;
  channelId: string;
  source: TranscodedSourceDocument | RtmpInputDocument;
  sourceType: SourceRefType;
  createdBy?: UserDocument;
  createdById: ObjectID;
}

interface TranscodedScheduleDocument extends ScheduleDocumentBase {
  source: TranscodedSourceDocument;
  sourceType: SourceRefType.TranscodedSource;
}

interface RtmpScheduleDocument extends ScheduleDocumentBase {
  source: RtmpInputDocument;
  sourceType: SourceRefType.RtmpInput;
}

export type ScheduleDocument = Document &
  (TranscodedScheduleDocument | RtmpScheduleDocument);

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
      required: true,
      refPath: 'sourceType',
      alias: 'sourceId',
    },
    sourceType: {
      type: SchemaTypes.String,
      required: true,
      enum: Object.values(SourceRefType),
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
