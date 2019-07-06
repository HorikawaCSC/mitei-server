import { Readable } from 'stream';

export interface GqlUpload {
  stream: Readable;
  filename: string;
  mimetype: string;
  encoding?: string;
  createReadStream(): Readable;
}
