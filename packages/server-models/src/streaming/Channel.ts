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
import {
  TranscodedSource,
  TranscodedSourceDocument,
} from '../TranscodedSource';
import { User, UserDocument } from '../User';
import { createRefIdVirtual } from '../utils/schema';

export enum FillerControl {
  Sequential = 'sequential',
  Random = 'random',
}

export enum ChannelPermission {
  Public = 'public',
  ViewerOnly = 'viewerOnly',
}

export interface ChannelDocument extends Document {
  _id: string;
  displayName: string;
  createdBy?: UserDocument;
  createdById: ObjectID;
  fillerSources: TranscodedSourceDocument[];
  fillerSourceIds: ObjectID[];
  fillerControl: FillerControl;
  permission: ChannelPermission;
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
    createdBy: {
      type: SchemaTypes.ObjectId,
      ref: User,
      required: true,
    },
    fillerSources: [
      {
        type: SchemaTypes.ObjectId,
        required: true,
        ref: TranscodedSource,
      },
    ],
    fillerControl: {
      type: SchemaTypes.String,
      enum: Object.values(FillerControl),
      required: true,
      default: FillerControl.Random,
    },
    permission: {
      type: SchemaTypes.String,
      enum: Object.values(ChannelPermission),
      required: true,
      default: ChannelPermission.ViewerOnly,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

schema
  .virtual('fillerSourceIds')
  .get(function(this: ChannelDocument): ObjectID[] {
    if (this.populated('fillerSources')) {
      return this.fillerSources.map(source => source._id);
    } else {
      return (this.fillerSources as unknown) as ObjectID[];
    }
  })
  .set(function(this: ChannelDocument, value: ObjectID[]) {
    if (this.populated('fillerSources')) {
      throw new Error('populated field not supported');
    } else {
      (this.fillerSources as unknown) = value;
    }
  });

createRefIdVirtual(schema, 'createdBy', 'createdById');

export const Channel = model<ChannelDocument>('Channel', schema);
