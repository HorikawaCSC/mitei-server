import { User } from '../models/User';

export const checkUser = (userInfo?: User) => {
  if (userInfo) return;
  throw new Error('not authorized');
};

export const checkAdmin = (userInfo?: User) => {
  if (userInfo && userInfo.kind === 'admin') return;
  throw new Error('not authorized');
};
