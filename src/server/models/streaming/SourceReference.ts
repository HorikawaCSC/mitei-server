import { ObjectID } from 'bson';
import { Document, Schema, SchemaTypes } from 'mongoose';
import { RtmpInputDocument } from '../RtmpInput';
import { TranscodedSourceDocument } from '../TranscodedSource';

export enum SourceRefType {
  RtmpInputDocument = 'RtmpInput',
  TranscodedSourceDocument = 'TranscodedSource',
}

export interface RtmpInputSourceReference {
  sourceId: ObjectID;
  source?: RtmpInputDocument;
  type: SourceRefType.RtmpInputDocument;
}

export interface TranscodedSourceReference {
  sourceId: ObjectID;
  source?: TranscodedSourceDocument;
  type: SourceRefType.TranscodedSourceDocument;
}

export type SourceReference = Document &
  (RtmpInputSourceReference | TranscodedSourceReference);

export const sourceReferenceSchema = (objName: string) =>
  new Schema(
    {
      source: {
        type: SchemaTypes.ObjectId,
        refPath: `${objName}.type`,
        alias: 'sourceId',
        required: true,
      },
      type: {
        type: SchemaTypes.String,
        enum: Object.values(SourceRefType),
        required: true,
      },
    },
    { _id: false },
  );
