import { Document, model, Schema, SchemaTypes } from 'mongoose';

export enum DeviceType {
  Chromecast = 'chromecast',
  Browser = 'browser',
}

export interface ViewerDeviceDocument extends Document {
  _id: string;
  displayName: string;
  createdAt?: Date;
  deviceType: DeviceType;
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
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export const ViewerDevice = model<ViewerDeviceDocument>('ViewerDevice', schema);
