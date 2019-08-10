import { DateTime } from 'luxon';

export const toStringDate = (date: string) => {
  return DateTime.fromISO(date).toFormat('yyyy/mm/dd HH:mm:ss');
};
