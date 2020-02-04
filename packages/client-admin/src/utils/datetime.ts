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
