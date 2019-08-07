import { ObjectId } from 'mongodb';
import { RtmpInput } from '../../models/RtmpInput';
import { ProgramType, Schedule } from '../../models/streaming/Schedule';
import { TranscodedSource } from '../../models/TranscodedSource';

export const checkOverlappedSchedule = async (startAt: Date, endAt: Date) => {
  return await Schedule.exists({
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
  });
};

export const checkTypeAndSource = async (
  type: ProgramType,
  sourceId?: ObjectId,
) => {
  if (type === ProgramType.Empty) {
    return true;
  } else if (type === ProgramType.Transcoded && sourceId) {
    return await TranscodedSource.exists({ _id: sourceId });
  } else if (type === ProgramType.Rtmp && sourceId) {
    return await RtmpInput.exists({ _id: sourceId });
  } else {
    return false;
  }
};
