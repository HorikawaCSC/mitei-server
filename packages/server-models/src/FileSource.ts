/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

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
    duration?: number;
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
  duration: SchemaTypes.Number,
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
