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

import { QueryResolvers } from '../../generated/graphql';
import { presetQueryResolvers } from './presets';
import { sourcesQueryResolvers } from './sources';
import { streamingQueryResolvers } from './streaming';
import { usersQueryResolver } from './users';
import { viewerQueryResolvers } from './viewer';

export const queryResolvers: QueryResolvers = {
  ...usersQueryResolver,
  ...sourcesQueryResolvers,
  ...streamingQueryResolvers,
  ...presetQueryResolvers,
  ...viewerQueryResolvers,
};
