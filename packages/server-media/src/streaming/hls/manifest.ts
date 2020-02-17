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

export interface ManifestItem {
  url: string;
  duration: number;
  discontinuityBegin?: boolean;
}

export interface ManifestInput {
  seqBegin: number;
  items: ManifestItem[];
  endList?: boolean;
}

export const generateManifest = (input: ManifestInput) => {
  const maxDuration = input.items
    .slice()
    .sort((a, b) => b.duration - a.duration)[0].duration;
  const content = [
    '#EXTM3U',
    `#EXT-X-TARGETDURATION:${Math.ceil(maxDuration) + 1}`,
    '#EXT-X-VERSION:4',
    `#EXT-X-MEDIA-SEQUENCE:${input.seqBegin}`,
  ];
  if (!input.endList) {
    const duration = input.items
      .slice(0, -1)
      .reduce((total, item) => total + item.duration, 0);
    content.push(`#EXT-X-START:TIME-OFFSET=-${duration},PRECISE=NO`);
  }
  for (const item of input.items) {
    if (item.discontinuityBegin) content.push('#EXT-X-DISCONTINUITY');

    content.push(`#EXTINF:${item.duration},`, item.url);
  }
  if (input.endList) {
    content.push('#EXT-X-ENDLIST');
  }

  return content.join('\n');
};
