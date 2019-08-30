import { createCipheriv, createDecipheriv, createHash } from 'crypto';
import { config } from '../../config';
import { base58 } from '../base58';

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
