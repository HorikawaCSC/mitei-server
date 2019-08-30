import { UserDocument, ViewerDeviceDocument } from '@mitei/server-models';

export interface GqlContext {
  userInfo?: UserDocument;
  deviceInfo?: ViewerDeviceDocument;
  requestAddr: string;
}
