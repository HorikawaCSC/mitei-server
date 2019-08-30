import * as jwt from 'jsonwebtoken';
import { config } from '../../config';

export enum TokenType {
  Registration = 'reg',
  AuthorizedClient = 'ath',
}
interface TokenPayload {
  typ: TokenType;
  dev: string;
}

export const createToken = (
  type: TokenType,
  deviceId: string,
  expiresIn = 3600,
) => {
  const payload: TokenPayload = {
    typ: type,
    dev: deviceId,
  };
  return jwt.sign(payload, config.secrets.viewToken, {
    expiresIn,
  });
};

export const parseToken = (token: string) => {
  const payload = jwt.verify(token, config.secrets.viewToken) as TokenPayload;
  return {
    type: payload.typ,
    deviceId: payload.dev,
  };
};
