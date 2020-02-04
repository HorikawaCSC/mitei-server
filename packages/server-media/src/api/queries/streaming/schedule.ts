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

import { Schedule } from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';

export const scheduleQueryResolvers: QueryResolvers = {
  scheduleList: async (_parent, { take, skip, startAt, endAt, ...query }) => {
    const conditions = omitUndefined(query) as Record<string, unknown>;

    if (startAt) {
      conditions.endAt = { $gte: startAt };
    }

    if (endAt) {
      conditions.startAt = { $lte: endAt };
    }

    const total = await Schedule.countDocuments(conditions);
    const result = await Schedule.find(conditions)
      .skip(skip || 0)
      .limit(take || 10);

    return {
      schedules: result,
      total,
    };
  },
  schedule: async (_parent, { id }) => {
    return (await Schedule.findById(id)) || null;
  },
};
