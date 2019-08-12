import Typography from '@material-ui/core/Typography';
import { PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { GetChannelDetailQuery } from '../../../api/generated/graphql';

export const ChannelInfoSection = ({
  channel,
}: {
  channel: NonNullable<GetChannelDetailQuery['channel']>;
}) => {
  return (
    <PageContainer title={`チャンネル: ${channel.displayName}`}>
      <Typography component='span'>ID: {channel.id}</Typography>
    </PageContainer>
  );
};
