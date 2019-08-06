import { parse } from 'path';

export const extractExtension = (fileName: string) => {
  return parse(fileName).ext.replace(/^\./, '');
};
