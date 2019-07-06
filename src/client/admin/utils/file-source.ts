import { Duration } from 'luxon';
import {
  GetFileSourcesSimpleQuery,
  TranscodeStatus,
} from '../../api/generated/graphql';

export const transcodeStatusText = {
  [TranscodeStatus.Pending]: '変換待ち/未変換',
  [TranscodeStatus.Running]: '変換中',
  [TranscodeStatus.Failed]: '変換エラー',
  [TranscodeStatus.Success]: '変換済み',
};

export const fileSourceSimpleDetailString = (
  info: GetFileSourcesSimpleQuery['fileSourceList']['sources'][0],
) => {
  if (!info.duration) {
    return `${transcodeStatusText[info.status]}`;
  }
  return `${transcodeStatusText[info.status]} 長さ: ${Duration.fromMillis(
    info.duration * 1000,
  ).toFormat('hh:mm:ss')}`;
};
