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

import { ViewerDevice } from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';

export const viewerListQueryResolvers: QueryResolvers = {
  viewerDevices: async (_parent, { skip, take, ...query }) => {
    const conditions = omitUndefined(query);

    const total = await ViewerDevice.countDocuments(conditions);
    const result = await ViewerDevice.find(conditions)
      .skip(skip || 0)
      .limit(take || 10)
      .exec();

    return {
      devices: result,
      total,
    };
  },
  viewerDevice: async (_parent, { id }) => {
    return await ViewerDevice.findById(id);
  },
};
