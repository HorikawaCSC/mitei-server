import { User } from '../models/User';

export interface GqlContext {
  userInfo?: User;
}
