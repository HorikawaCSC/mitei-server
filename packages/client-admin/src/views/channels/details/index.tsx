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
