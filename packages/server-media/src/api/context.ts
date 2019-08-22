import { UserDocument } from '@mitei/server-models';

export interface GqlContext {
  userInfo?: UserDocument;
  requestAddr: string;
}
