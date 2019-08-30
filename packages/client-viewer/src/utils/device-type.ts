import { DeviceType } from '../api/generated/graphql';

export const getDeviceType = () => {
  if (navigator.userAgent.includes('CrKey')) {
    return DeviceType.Chromecast;
  }
  return DeviceType.Browser;
};
