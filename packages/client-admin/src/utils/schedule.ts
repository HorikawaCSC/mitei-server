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
  };
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
