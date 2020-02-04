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

import { SourceType } from '@mitei/server-models';
import { TranscodedSourceResolvers } from '../../generated/graphql';

export const transcodedSourceResolvers: TranscodedSourceResolvers = {
  __resolveType: source => {
    if (source.type === SourceType.File) return 'FileSource';
    if (source.type === SourceType.Record) return 'RecordSource';

    return null;
  },
  createdBy: async source => {
    await source.populate('createdBy', '-token -tokenSecret').execPopulate();
    if (!source.createdBy) throw new Error('failed to populate');

    return source.createdBy;
  },
  preset: async source => {
    await source.populate('preset').execPopulate();
    if (!source.preset) return null;

    return source.preset;
  },
};
