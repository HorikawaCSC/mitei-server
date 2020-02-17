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

import { Manifest } from '@mitei/server-models';
import {
  EMPTY_FILLER_MAX_DURATION,
  EMPTY_FILLER_OFFSET,
  EMPTY_FILLER_SEGMENT_DURATION,
} from './empty-filler';
import { ManifestRef } from './resolver';

type Source = {
  id?: string;
  manifest: Manifest[];
};

export class ManifestList {
  private _manifest: ManifestRef[] = [];
  private _totalDurationCache = 0;

  get manifest() {
    return this._manifest;
  }

  get totalDuration() {
    return this._totalDurationCache;
  }

  loadFromSource(
    source: Source,
    condition?: (
      itemDuration: number,
      loadedDuration: number,
      totalDuration: number,
      itemCreated?: number,
    ) => boolean,
    breakAtFalseCondition?: boolean,
  ) {
    if (!source.id) throw new Error('source must have id');
    let duration = 0;
    let isBegin = true;
    for (const item of source.manifest) {
      if (
        condition &&
        !condition(
          item[2],
          duration,
          this._totalDurationCache + duration,
          item[3],
        )
      ) {
        if (breakAtFalseCondition) {
          break;
        } else {
          continue;
        }
      }

      duration += item[2];
      this._manifest.push({
        type: 'source',
        sourceId: source.id,
        offset: item[0],
        length: item[1],
        duration: item[2],
        discontiniuity: isBegin,
      });

      isBegin = false;
    }

    this._totalDurationCache += duration;

    return duration;
  }

  loadFromList(list: ManifestList) {
    this._manifest.push(...list.manifest);
    this._totalDurationCache += list.totalDuration;
  }

  loadEmptyFiller(duration: number) {
    if (duration > EMPTY_FILLER_MAX_DURATION)
      throw new Error('requested duration is too long');
    if (duration < EMPTY_FILLER_SEGMENT_DURATION)
      return EMPTY_FILLER_SEGMENT_DURATION;

    const count = Math.round(duration / EMPTY_FILLER_SEGMENT_DURATION);
    const actualDuration = EMPTY_FILLER_SEGMENT_DURATION * count;
    this._manifest.push({
      type: 'empty',
      sourceId: '',
      offset: 0,
      length: EMPTY_FILLER_OFFSET[count - 1],
      duration: actualDuration,
      discontiniuity:
        this._manifest.length === 0 ||
        this._manifest[this._manifest.length - 1].type !== 'empty',
    });
    this._totalDurationCache += actualDuration;

    return actualDuration;
  }

  select(skipDuration: number, maxDuration: number, minSegment: number) {
    let duration = 0;
    let skips = 0;
    let selectedDuration = 0;

    const manifest: ManifestRef[] = [];

    for (const item of this._manifest) {
      duration += item.duration;

      if (duration >= skipDuration) {
        selectedDuration += item.duration;
        manifest.push(item);

        if (selectedDuration >= maxDuration && manifest.length >= minSegment)
          break;
      } else {
        skips++;
      }
    }

    return { skips, manifest, duration: selectedDuration };
  }
}
