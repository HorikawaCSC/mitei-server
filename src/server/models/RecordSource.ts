import { ObjectID } from 'bson';
import { model, Schema, SchemaTypes } from 'mongoose';
import { RtmpInput, RtmpInputDocument } from './RtmpInput';
import {
  TranscodedSourceDocumentBase,
  transcodedSourceSchemaBase,
} from './TranscodedSource';

export interface RecordSourceDocument extends TranscodedSourceDocumentBase {
  sourceId: ObjectID;
  source?: RtmpInputDocument;
  error?: string;
}

const schema = new Schema(
  {
    ...transcodedSourceSchemaBase,
    error: SchemaTypes.String,
    source: {
      type: SchemaTypes.ObjectId,
      ref: RtmpInput,
      required: true,
      alias: 'sourceId',
    },
  },
  {
    timestamps: true,
  },
);

export const RecordSource = model<RecordSourceDocument>('RecordSource', schema);
