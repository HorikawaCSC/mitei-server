import { ObjectId } from 'mongodb';
import { TranscodeStatus } from '../../generated/graphql';
import { RtmpInput } from '../../models/RtmpInput';
import { ProgramType, Schedule } from '../../models/streaming/Schedule';
import { TranscodedSource } from '../../models/TranscodedSource';

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
