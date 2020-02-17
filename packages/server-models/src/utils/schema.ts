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

import { ObjectID } from 'mongodb';
import { Document, Schema } from 'mongoose';

type RefDoc = Document & {
  [k: string]: Document;
};

type StrOnly<T> = T extends string ? T : never;

export const createRefIdVirtual = <T extends Document>(
  schema: Schema<T>,
  field: StrOnly<keyof T>,
  idField: StrOnly<keyof T>,
) => {
  schema
    .virtual(idField)
    .get(function(this: RefDoc) {
      if (this.populated(field)) {
        return (this[field] as Document)._id;
      } else {
        return this[field];
      }
    })
    .set(function(this: RefDoc, value: ObjectID) {
      if (this.populated(field)) {
        throw new Error('populated field not supported');
      } else {
        (this[field] as unknown) = value;
      }
    });
};
