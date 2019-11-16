import { ObjectID } from 'bson';
import { Schema, SchemaTypes } from 'mongoose';
import { RtmpInput, RtmpInputDocument } from './RtmpInput';
import { TranscodedSource, TranscodedSourceDocument } from './TranscodedSource';
import { createRefIdVirtual } from './utils/schema';

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

createRefIdVirtual(schema, 'source', 'sourceId');

export const RecordSource = TranscodedSource.discriminator<
  RecordSourceDocument
>('record', schema);
