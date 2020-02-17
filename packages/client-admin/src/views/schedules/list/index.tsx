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
import { PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import useRouter from 'use-react-router';
import { ChannelSelect } from '../../../components/shared/ChannelSelect';
import { HeadTitle } from '../../../components/shared/HeadTitle';
import { ScheduleList } from './list';

export const ScheduleListSelector = ({
  match,
  location,
}: RouteComponentProps<{ channelId?: string }>) => {
  const { channelId } = match.params;
  const query = new URLSearchParams(location.search);
  const day = query.get('day');
  const { history } = useRouter();
  const handleChannelChange = (id: string) => {
    history.push(`/schedules/${id}`);
  };

  return (
    <>
      <HeadTitle title='スケジュール一覧' />
      <PageContainer title='チャンネル選択'>
        <Typography component='p'>
          チャンネルを選択してスケジュールを表示
        </Typography>
        <ChannelSelect
          value={channelId || ''}
          handleChange={handleChannelChange}
        />
      </PageContainer>
      {channelId && <ScheduleList channelId={channelId} day={day} />}
    </>
  );
};
