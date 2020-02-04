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

import { Document, model, Schema, SchemaTypes } from 'mongoose';

export enum UserKind {
  Admin = 'admin',
  Normal = 'normal',
}
export enum AuthType {
  Twitter = 'twitter',
}

export interface UserDocument extends Document {
  userId: string;
  type: AuthType;
  token: string;
  tokenSecret: string;
  screenName: string;
  iconUrl?: string;
  kind: UserKind;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<UserDocument>(
  {
    userId: {
      type: SchemaTypes.String,
      required: true,
    },
    type: {
      type: SchemaTypes.String,
      enum: Object.values(AuthType),
      required: true,
      default: AuthType.Twitter,
    },
    token: {
      type: SchemaTypes.String,
      required: true,
      default: '',
    },
    tokenSecret: {
      type: SchemaTypes.String,
      required: true,
      default: '',
    },
    screenName: {
      type: SchemaTypes.String,
      required: true,
      default: '',
    },
    iconUrl: SchemaTypes.String,
    kind: {
      type: SchemaTypes.String,
      enum: Object.values(UserKind),
      required: true,
      default: UserKind.Normal,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ type: 1, userId: 1 }, { unique: true });

export const User = model<UserDocument>('User', schema);
