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

import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { PageContainer } from '../PageContainer';

export const NotFoundView = ({ error }: { error?: string }) => {
  return (
    <PageContainer title='404 Not Found'>
      <Typography variant='h5'>ページが見つかりませんでした。</Typography>
      {error && <Typography component='p'>{error}</Typography>}
    </PageContainer>
  );
};
