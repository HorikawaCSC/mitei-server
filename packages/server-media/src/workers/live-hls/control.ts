import fetch from 'node-fetch';
import { config } from '../../config';

const appName = config.streaming.rtmpAddress.replace(/.+\//, '');
export const dropConnection = async (name: string) => {
  const response = await fetch(
    `${config.streaming.rtmpControlEndpoint}/drop/client?app=${appName}&name=${name}`,
  );
  return response.ok;
};
