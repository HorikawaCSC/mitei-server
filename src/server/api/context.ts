import { UserDocument } from '../models/User';

export interface GqlContext {
  userInfo?: UserDocument;
}
