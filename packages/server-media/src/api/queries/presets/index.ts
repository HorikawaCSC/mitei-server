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

import { TranscodePreset } from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';

export const presetQueryResolvers: QueryResolvers = {
  transcodePreset: async (_parent, { id }) => {
    const preset = await TranscodePreset.findById(id);
    if (!preset) throw new Error('no preset');
    return preset;
  },
  transcodePresetList: async (_parent, { skip, take, ...query }) => {
    const conditions = omitUndefined(query);

    const total = await TranscodePreset.countDocuments(conditions);
    const result = await TranscodePreset.find(conditions)
      .skip(skip || 0)
      .limit(take || 10)
      .exec();

    return {
      presets: result,
      total,
    };
  },
};
