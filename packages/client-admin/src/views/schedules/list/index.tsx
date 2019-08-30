import Typography from '@material-ui/core/Typography';
import { PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import useRouter from 'use-react-router';
import { ChannelSelect } from '../../../components/shared/ChannelSelect';
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
