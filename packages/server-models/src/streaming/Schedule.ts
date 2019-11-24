import { ObjectID } from 'bson';
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { User, UserDocument } from '../User';
import { createRefIdVirtual } from '../utils/schema';
import { Channel, ChannelDocument } from './Channel';

export enum ProgramType {
  Rtmp = 'rtmp',
  Transcoded = 'transcoded',
  Empty = 'empty',
}

export interface ProgramDocument {
  _id: ObjectID;
  type: ProgramType;
  duration: number;
  sourceId?: ObjectID;
}

export interface ScheduleDocument extends Document {
  title: string;
  startAt: Date;
  endAt: Date;
  channel?: ChannelDocument;
  channelId: string;
  programs: ProgramDocument[];
  createdBy?: UserDocument;
  createdById: ObjectID;

  isProgramValid(): boolean;
}

const schema = new Schema(
  {
    title: {
      type: SchemaTypes.String,
      required: true,
    },
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
    },
    programs: [
      new Schema({
        type: {
          type: SchemaTypes.String,
          enum: Object.values(ProgramType),
          default: ProgramType.Transcoded,
          required: true,
        },
        sourceId: {
          type: SchemaTypes.ObjectId,
        },
        duration: {
          type: SchemaTypes.Number,
          required: true,
        },
      }),
    ],
    createdBy: {
      type: SchemaTypes.ObjectId,
      ref: User,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.method('isProgramValid', function(this: ScheduleDocument): boolean {
  const duration = this.programs.reduce(
    (duration, program) => duration + program.duration,
    0,
  );
  const scheduleDuration =
    (this.endAt.getTime() - this.startAt.getTime()) / 1000;
  if (duration - scheduleDuration > 2) return false;

  return true;
});

createRefIdVirtual(schema, 'createdBy', 'createdById');
createRefIdVirtual(schema, 'channel', 'channelId');

export const Schedule = model<ScheduleDocument>('Schedule', schema);
