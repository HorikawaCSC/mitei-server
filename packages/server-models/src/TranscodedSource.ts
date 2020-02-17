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
import { Document, model, Schema, SchemaTypes } from 'mongoose';
import { TranscodePreset, TranscodePresetDocument } from './TranscodePreset';
import { User, UserDocument } from './User';
import { createRefIdVirtual } from './utils/schema';

export enum TranscodeStatus {
  Pending = 'pending',
  Running = 'running',
  Waiting = 'waiting',
  Success = 'success',
  Failed = 'failed',
}

export enum SourceType {
  File = 'file',
  Record = 'record',
}

// offset size duration date
export type Manifest = [number, number, number, number | undefined];

export interface TranscodedSourceDocument extends Document {
  createdById: ObjectID;
  createdBy?: UserDocument;
  status: TranscodeStatus;
  name: string;
  manifest: Manifest[];
  duration?: number;
  thumbnailPath?: string;
  width?: number;
  height?: number;
  presetId?: ObjectID;
  preset?: TranscodePresetDocument;
  createdAt?: Date;
  updatedAt?: Date;
  type: SourceType;
}

const schema = new Schema(
  {
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: User,
    },
    name: {
      type: SchemaTypes.String,
      required: true,
      default: '',
    },
    status: {
      type: SchemaTypes.String,
      required: true,
      default: TranscodeStatus.Pending,
    },
    manifest: {
      type: [SchemaTypes.Array],
      required: true,
      default: [],
    },
    preset: {
      type: SchemaTypes.ObjectId,
      ref: TranscodePreset,
    },
    duration: SchemaTypes.Number,
    thumbnailPath: SchemaTypes.String,
    width: SchemaTypes.Number,
    height: SchemaTypes.Number,
  },
  {
    timestamps: true,
    discriminatorKey: 'type',
  },
);

createRefIdVirtual(schema, 'createdBy', 'createdById');
createRefIdVirtual(schema, 'preset', 'presetId');

export const TranscodedSource = model<TranscodedSourceDocument>(
  'TranscodedSource',
  schema,
);
