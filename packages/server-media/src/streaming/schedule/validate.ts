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

import {
  ProgramType,
  RtmpInput,
  Schedule,
  TranscodedSource,
} from '@mitei/server-models';
import { ObjectId } from 'mongodb';
import { TranscodeStatus } from '../../generated/graphql';

export const checkOverlappedSchedule = async (
  startAt: Date,
  endAt: Date,
  excludeId?: ObjectId,
) => {
  const baseCondition = {
    $or: [
      {
        startAt: {
          $gte: startAt,
          $lt: endAt,
        },
      },
      {
        endAt: {
          $gt: startAt,
          $lte: endAt,
        },
      },
    ],
  };
  return await Schedule.exists(
    excludeId
      ? {
          $and: [
            baseCondition,
            {
              _id: { $ne: excludeId },
            },
          ],
        }
      : baseCondition,
  );
};

export const checkTypeAndSource = async (
  type: ProgramType,
  sourceId?: ObjectId,
) => {
  if (type === ProgramType.Empty) {
    return true;
  } else if (type === ProgramType.Transcoded && sourceId) {
    return await TranscodedSource.exists({
      _id: sourceId,
      status: TranscodeStatus.Success,
    });
  } else if (type === ProgramType.Rtmp && sourceId) {
    return await RtmpInput.exists({ _id: sourceId });
  } else {
    return false;
  }
};
