/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

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
