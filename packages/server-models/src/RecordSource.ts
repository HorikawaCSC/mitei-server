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
