import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useGetScheduleQuery } from '../../../api/generated/graphql';
import { ScheduleInfoSection } from '../../../components/schedules/ScheduleInfoSection';

export const ScheduleDetailView = ({
  match,
}: RouteComponentProps<{ scheduleId: string }>) => {
  const { scheduleId } = match.params;
  const { data, loading, error } = useGetScheduleQuery({
    variables: { id: scheduleId },
    errorPolicy: 'all',
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
      <ScheduleInfoSection schedule={schedule} />
    </>
  );
};
