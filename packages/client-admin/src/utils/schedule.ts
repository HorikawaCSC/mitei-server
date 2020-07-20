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
import { ProgramType } from '../api/generated/graphql';

export const programTypeText = {
  [ProgramType.Empty]: 'フィラー',
  [ProgramType.Rtmp]: '生放送',
  [ProgramType.Transcoded]: 'ファイル',
};

export type SimpleProgramData = {
  type: ProgramType;
  duration: number;
  source?: {
    id: string;
    name: string;
  } | null;
};
export const programText = (input: SimpleProgramData) => {
  const duration = Duration.fromMillis(input.duration * 1000).toFormat(
    'hh:mm:ss',
  );
  if (input.type === ProgramType.Empty) {
    return `[${programTypeText[input.type]}] ${duration}`;
  } else {
    return `[${programTypeText[input.type]}] ${(input.source
      ? input.source.name
      : null) || '不明'} ${duration}`;
  }
};
