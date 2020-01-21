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
