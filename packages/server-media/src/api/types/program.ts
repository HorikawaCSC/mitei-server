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

import { ProgramType, RtmpInput, TranscodedSource } from '@mitei/server-models';
import { ProgramResolvers } from '../../generated/graphql';

export const programResolvers: ProgramResolvers = {
  // @ts-ignore
  source: async parent => {
    if (parent.type === ProgramType.Empty) {
      return null;
    } else if (parent.type === ProgramType.Rtmp && parent.sourceId) {
      return await RtmpInput.findById(parent.sourceId);
    } else if (parent.type === ProgramType.Transcoded && parent.sourceId) {
      return await TranscodedSource.findById(parent.sourceId);
    } else {
      throw new Error('invalid source');
    }
  },
};
