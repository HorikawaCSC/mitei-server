import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { createRefIdVirtual } from '../utils/schema';

export enum DeviceType {
  Chromecast = 'chromecast',
  Browser = 'browser',
}

export interface ViewerDeviceDocument extends Document {
  _id: string;
  displayName: string;
  createdAt?: Date;
  updatedAt?: Date;
  deviceType: DeviceType;
  volume: number;
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
    deviceType: {
      type: SchemaTypes.String,
      enum: Object.values(DeviceType),
      required: true,
      default: DeviceType.Browser,
      alias: 'type',
    },
    volume: {
      type: SchemaTypes.Number,
      min: 0,
      max: 100,
      default: 50,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  },
);

createRefIdVirtual(schema, 'playingSource', 'playingSourceId');

export const ViewerDevice = model<ViewerDeviceDocument>('ViewerDevice', schema);
