import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView, routes } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useGetChannelDetailQuery } from '../../../api/generated/graphql';
import { ChannelInfoSection } from '../../../components/channels/ChannelInfoSection';
import { FillerListSection } from '../../../components/channels/FillerListSection';
import { PreviewSection } from '../../../components/shared/PreviewSection';

export const ChannelDetailView = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const { id } = match.params;
  const { loading, error, data, refetch } = useGetChannelDetailQuery({
    variables: { id },
    fetchPolicy: 'network-only',
  });

  if (loading) return <CircularProgress />;

  if (!data || !data.channel || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { channel } = data;

  return (
    <>
      <ChannelInfoSection channel={channel} refetch={refetch} />
      <PreviewSection
        source={routes.media.channel(channel.id)}
      ></PreviewSection>
      <FillerListSection channel={channel} refetch={refetch} />
    </>
  );
};
