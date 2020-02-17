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

interface RtmpEventBase<T = string> {
  call: T;
  addr: string;
  app: string;
  flashver: string;
  swfurl: string;
  tcurl: string;
  pageurl: string;
}

export interface RtmpPublishEvent extends RtmpEventBase<'publish'> {
  clientid: string;
  name: string;
  [key: string]: string;
}

export interface RtmpPlayEvent extends RtmpEventBase<'play'> {
  clientid: string;
  name: string;
  [key: string]: string;
}
export interface RtmpPublishDoneEvent extends RtmpEventBase<'publish_done'> {
  clientid: string;
  name: string;
  [key: string]: string;
}

export type RtmpEvent = RtmpPublishEvent | RtmpPublishDoneEvent | RtmpPlayEvent;
