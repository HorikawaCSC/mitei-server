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

import { createCipheriv, createDecipheriv, createHash } from 'crypto';
import { config } from '../../config';
import { base58 } from '../../utils/base58';

const segBufSecret = createHash('md5')
  .update(config.secrets.segmentRef)
  .digest()
  .slice(0, 8);

export const encodeSegmentRef = (offset: number, length: number) => {
  const buf = Buffer.alloc(8);
  buf.writeUIntBE(offset / 188, 0, 4);
  buf.writeUIntBE(length / 188, 4, 4);

  const cipher = createCipheriv('bf-ecb', segBufSecret, '');
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(buf), cipher.final()]);

  return base58.encode(encrypted);
};

export const decodeSegmentRef = (refText: string) => {
  const encrypted = base58.decode(refText);

  const decipher = createDecipheriv('bf-ecb', segBufSecret, '');
  decipher.setAutoPadding(false);
  const buf = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  const offset = buf.readUIntBE(0, 4) * 188;
  const length = buf.readUIntBE(4, 4) * 188;
  return { offset, length };
};
