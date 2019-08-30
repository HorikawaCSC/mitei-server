import { promises as fs } from 'fs';

export const readFileHandle = async (
  fh: fs.FileHandle,
  offset: number,
  length: number,
) => {
  const buf = Buffer.alloc(length);

  let read = 0;
  while (read < length) {
    const { bytesRead } = await fh.read(
      buf,
      read,
      length - read,
      offset + read,
    );
    read += bytesRead;
  }

  return buf;
};
