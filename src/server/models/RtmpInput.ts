import { Document, model, Schema, SchemaTypes } from 'mongoose';

export enum RtmpStatus {
  Live = 'live',
  Unused = 'unused',
}
export interface RtmpInputDocument extends Document {
  name: string;
  status: RtmpStatus;
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
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export const RtmpInput = model<RtmpInputDocument>('RtmpInput', schema);
