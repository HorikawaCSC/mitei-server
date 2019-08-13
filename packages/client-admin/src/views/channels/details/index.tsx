import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useGetChannelDetailQuery } from '../../../api/generated/graphql';
import { ChannelInfoSection } from '../../../components/channels/ChannelInfoSection';
import { FillerListSection } from '../../../components/channels/FillerListSection';

export const ChannelDetailView = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const { id } = match.params;
  const { loading, error, data, refetch } = useGetChannelDetailQuery({
    variables: { id },
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
  });

  if (loading) return <CircularProgress />;

  if (!data || !data.channel || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { channel } = data;

  return (
    <>
      <ChannelInfoSection channel={channel} refetch={refetch} />
      <FillerListSection channel={channel} refetch={refetch} />
    </>
  );
};
