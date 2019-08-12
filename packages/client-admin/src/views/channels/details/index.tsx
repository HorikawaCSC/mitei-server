import CircularProgress from '@material-ui/core/CircularProgress';
import { useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useGetChannelDetailQuery } from '../../../api/generated/graphql';
import { ChannelInfoSection } from '../../../components/channels/ChannelInfoSection';
import { FillerListSection } from '../../../components/channels/FillerListSection';

export const ChannelDetailView = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const { id } = match.params;
  const { loading, error, data } = useGetChannelDetailQuery({
    variables: { id },
    errorPolicy: 'all',
  });
  const openErrorMessage = useErrorSnack();

  if (loading) return <CircularProgress />;

  if (!data || !data.channel || error) {
    openErrorMessage(error ? error.message : 'ファイル一覧の取得に失敗');
    return null;
  }

  const { channel } = data;

  return (
    <>
      <ChannelInfoSection channel={channel} />
      <FillerListSection channel={channel} />
    </>
  );
};
