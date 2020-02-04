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

import { Typography } from '@material-ui/core';
import { PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { GetViewerDeviceQuery } from '../../../api/generated/graphql';
import { deviceType } from '../../../utils/viewers';
import { OnlineBadge } from '../OnlineBadge';

type Props = { device: NonNullable<GetViewerDeviceQuery['viewerDevice']> };
export const SummarySection = ({ device }: Props) => {
  return (
    <PageContainer title='概要'>
      <Typography>デバイス名: {device.displayName}</Typography>
      <Typography>デバイス種別: {deviceType[device.type]}</Typography>
      <Typography variant='h6'>ステータス</Typography>
      <OnlineBadge online={device.online} />
    </PageContainer>
  );
};
