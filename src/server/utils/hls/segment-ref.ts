import { createCipheriv, createDecipheriv, createHash } from 'crypto';
import { config } from '../../config';
import { base58 } from '../base58';

const segBufSecret = createHash('md5')
  .update(config.secrets.segmentRef)
  .digest();

export const encodeSegmentRef = (offset: number, length: number) => {
  const buf = Buffer.alloc(12);
  buf.writeUIntBE(offset, 0, 6);
  buf.writeUIntBE(length, 6, 6);

  const cipher = createCipheriv('aes-128-ecb', segBufSecret, '');
  const encrypted = Buffer.concat([cipher.update(buf), cipher.final()]);

  return base58.encode(encrypted);
};

export const decodeSegmentRef = (refText: string) => {
  const encrypted = base58.decode(refText);

  const decipher = createDecipheriv('aes-128-ecb', segBufSecret, '');
  const buf = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  const offset = buf.readUIntBE(0, 6);
  const length = buf.readUIntBE(6, 6);
  return { offset, length };
};
