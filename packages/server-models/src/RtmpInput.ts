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

export interface RtmpInputDocument extends Document {
  name: string;
  createdBy?: UserDocument;
  createdById: ObjectID;
  preset?: TranscodePresetDocument;
  presetId: ObjectID;
  createdAt?: Date;
}

const schema = new Schema(
  {
    name: {
      type: SchemaTypes.String,
      required: true,
      default: 'input',
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: User,
    },
    preset: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: TranscodePreset,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

createRefIdVirtual(schema, 'createdBy', 'createdById');
createRefIdVirtual(schema, 'preset', 'presetId');

export const RtmpInput = model<RtmpInputDocument>('RtmpInput', schema);
