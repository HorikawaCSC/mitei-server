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
import {
  useGetViewerDeviceQuery,
  useViewerStateSingleSubscription,
} from '../../../api/generated/graphql';
import { HeadTitle } from '../../../components/shared/HeadTitle';
import { DeviceDispatchSection } from '../../../components/viewers/DeviceDispatchSection';
import { SummarySection } from '../../../components/viewers/SummarySection';

type Props = RouteComponentProps<{ id: string }>;
export const ViewerDetails = (props: Props) => {
  const { data, loading, error } = useGetViewerDeviceQuery({
    variables: {
      id: props.match.params.id,
    },
  });
  const { data: realtimeDev } = useViewerStateSingleSubscription({
    variables: {
      id: props.match.params.id,
    },
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.viewerDevice || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const device = realtimeDev
    ? realtimeDev.viewerUpdateDevice
    : data.viewerDevice;

  return (
    <>
      <HeadTitle title={`${device.displayName} - サイネージ詳細`} />
      <SummarySection device={device} />
      <DeviceDispatchSection device={device} />
    </>
  );
};
