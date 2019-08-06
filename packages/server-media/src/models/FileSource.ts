import { Schema, SchemaTypes } from 'mongoose';
import {
  TranscodedSource,
  TranscodedSourceDocument,
  TranscodeStatus,
} from './TranscodedSource';

export enum SourceStatus {
  Uploading = 'uploading',
  Available = 'available',
  Deleted = 'deleted',
}

export interface FileSourceDocument extends TranscodedSourceDocument {
  source: {
    extension: string;
    status: SourceStatus;
    width?: number;
    height?: number;
    fileSize: number;
  };
  error?: string;
  transcodable: boolean;
}

const sourceSchema = new Schema({
  extension: {
    type: SchemaTypes.String,
    required: true,
  },
  status: {
    type: SchemaTypes.String,
    required: true,
    enum: Object.values(SourceStatus),
    default: SourceStatus.Uploading,
  },
  width: SchemaTypes.Number,
  height: SchemaTypes.Number,
  fileSize: SchemaTypes.Number,
});

const schema = new Schema({
  error: SchemaTypes.String,
  source: sourceSchema,
});

schema.virtual('transcodable').get(function(this: FileSourceDocument) {
  return (
    !!this.source.width &&
    this.source.status === SourceStatus.Available &&
    (this.status === TranscodeStatus.Pending ||
      this.status === TranscodeStatus.Failed)
  );
});

export const FileSource = TranscodedSource.discriminator<FileSourceDocument>(
  'file',
  schema,
);
