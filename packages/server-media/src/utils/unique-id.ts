import { randomBytes } from 'crypto';
import { base58 } from './base58';

export const createUniqueId = (byteLength = 16) => {
  return base58.encode(randomBytes(byteLength));
};
