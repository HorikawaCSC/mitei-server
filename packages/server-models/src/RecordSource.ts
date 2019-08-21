import { ObjectID } from 'bson';
import { Schema, SchemaTypes } from 'mongoose';
import { RtmpInput, RtmpInputDocument } from './RtmpInput';
import { TranscodedSource, TranscodedSourceDocument } from './TranscodedSource';

export interface RecordSourceDocument extends TranscodedSourceDocument {
  sourceId: ObjectID;
  source?: RtmpInputDocument;
  error?: string;
  lastManifestAppend: Date;
}

const schema = new Schema(
  {
    error: SchemaTypes.String,
    source: {
      type: SchemaTypes.ObjectId,
      ref: RtmpInput,
      required: true,
      alias: 'sourceId',
    },
    lastManifestAppend: {
      type: SchemaTypes.Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const RecordSource = TranscodedSource.discriminator<
  RecordSourceDocument
>('record', schema);
