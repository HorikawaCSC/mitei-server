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

import { Duration } from 'luxon';
import {
  RtmpStatus,
  SourceStatus,
  TranscodeStatus,
} from '../api/generated/graphql';

export const sourceTypeText = {
  FileSource: 'ファイル',
  RecordSource: '録画',
};
export const transcodeStatusText = {
  [TranscodeStatus.Pending]: '未変換',
  [TranscodeStatus.Waiting]: '変換待機中',
  [TranscodeStatus.Running]: '変換中',
  [TranscodeStatus.Failed]: '変換エラー',
  [TranscodeStatus.Success]: '変換済み',
};

type FileSourceSimpleData = {
  duration?: number | null;
  status: TranscodeStatus;
  transcodeProgress?: number | null;
  source: {
    status: SourceStatus;
  };
};

export const fileSourceSimpleDetailString = (info: FileSourceSimpleData) => {
  if (info.source.status === SourceStatus.Uploading) {
    return 'アップロード待機中/エラー';
  }

  if (!info.duration) {
    return `${transcodeStatusText[info.status]}`;
  }
  return `${transcodeStatusText[info.status]} ${Math.ceil(
    info.transcodeProgress || 0,
  ) || ''} 長さ: ${Duration.fromMillis(info.duration * 1000).toFormat(
    'hh:mm:ss',
  )}`;
};

type RecordSourceSimpleData = {
  duration?: number | null;
  status: TranscodeStatus;
};

export const recordSourceSimpleDetailString = (
  info: RecordSourceSimpleData,
) => {
  if (!info.duration) {
    return `${transcodeStatusText[info.status]}`;
  }
  return `${transcodeStatusText[info.status]} 長さ: ${Duration.fromMillis(
    info.duration * 1000,
  ).toFormat('hh:mm:ss')}`;
};

type SourceSimpleData = {
  __typename?: 'FileSource' | 'RecordSource';
  duration?: number | null;
  status: TranscodeStatus;
};

export const sourceSimpleString = (info: SourceSimpleData) => {
  const sourceType = info.__typename ? sourceTypeText[info.__typename] : '不明';
  if (!info.duration) {
    return `[${sourceType}] ${transcodeStatusText[info.status]}`;
  }
  return `[${sourceType}] ${
    transcodeStatusText[info.status]
  } 長さ: ${Duration.fromMillis(info.duration * 1000).toFormat('hh:mm:ss')}`;
};

export const rtmpStatusText = {
  [RtmpStatus.Unused]: '待機中',
  [RtmpStatus.Live]: '配信中',
};

type RtmpInputSimpleData = {
  status: RtmpStatus;
  publishUrl: string;
  preset: {
    name: string;
  };
};

export const rtmpInputSimpleWithUrlString = (input: RtmpInputSimpleData) => {
  return `${rtmpStatusText[input.status]} / 配信先: ${
    input.publishUrl
  } / エンコ設定: ${input.preset.name}`;
};

export const rtmpInputSimpleString = (
  input: Pick<RtmpInputSimpleData, 'preset'>,
) => {
  return `エンコ設定: ${input.preset.name}`;
};

export const fileStatusText = {
  [SourceStatus.Available]: 'ファイルあり',
  [SourceStatus.Uploading]: 'アップロード待機中/エラー',
  [SourceStatus.Deleted]: '削除済み',
};
