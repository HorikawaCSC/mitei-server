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

import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useGetScheduleQuery } from '../../../api/generated/graphql';
import { ProgramListSection } from '../../../components/schedules/ProgramListSection';
import { ScheduleInfoSection } from '../../../components/schedules/ScheduleInfoSection';
import { HeadTitle } from '../../../components/shared/HeadTitle';

export const ScheduleDetailView = ({
  match,
}: RouteComponentProps<{ scheduleId: string }>) => {
  const { scheduleId } = match.params;
  const { data, loading, error } = useGetScheduleQuery({
    variables: { id: scheduleId },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.schedule || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { schedule } = data;

  return (
    <>
      <HeadTitle
        title={`${schedule.title}[${schedule.channel.displayName}] - スケジュール詳細`}
      />
      <ScheduleInfoSection schedule={schedule} />
      <ProgramListSection schedule={schedule} />
    </>
  );
};
