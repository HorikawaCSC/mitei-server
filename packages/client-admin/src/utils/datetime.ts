import { DateTime } from 'luxon';

export const toDate = (date: string | DateTime) => {
  if (typeof date === 'string') return DateTime.fromISO(date);
  return date;
};

export const toStringDate = (
  date: string | DateTime,
  format = 'yyyy/MM/dd HH:mm:ss',
) => {
  return toDate(date).toFormat(format);
};

export const dateDiffText = (
  big: string | DateTime,
  small: string | DateTime,
  format = 'hh:mm:ss',
) => {
  return toDate(big)
    .diff(toDate(small))
    .toFormat(format);
};
