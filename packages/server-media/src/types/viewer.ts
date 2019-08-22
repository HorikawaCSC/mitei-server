import { DeviceType } from '../generated/graphql';

export interface ViewerChallengeData {
  type: DeviceType;
  date: number;
  code: string;
  accept: boolean;
  from: string;
  token?: string;
}
