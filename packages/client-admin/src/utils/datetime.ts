import { DateTime } from 'luxon';

export const toStringDate = (date: string, format = 'yyyy/MM/dd HH:mm:ss') => {
  return DateTime.fromISO(date).toFormat(format);
};
