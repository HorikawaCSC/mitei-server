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

import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import {
  useUpdateViewerStateMutation,
  ViewerRequestParam,
  ViewerStateSingleSubscription,
} from '../../../api/generated/graphql';
import { Controller } from '../Controller';

type Props = {
  device: Pick<
    ViewerStateSingleSubscription['viewerUpdateDevice'],
    'playingContent' | 'state' | 'volume' | 'id'
  >;
};
export const DeviceDispatchSection = ({ device }: Props) => {
  const [updateViewer] = useUpdateViewerStateMutation({
    errorPolicy: 'all',
  });
  const showErrorDialog = useErrorDialog();
  const handleDispatch = React.useCallback(
    async (request: Omit<ViewerRequestParam, 'device'>) => {
      const { data, errors } = await updateViewer({
        variables: {
          request: {
            ...request,
            device: device.id,
          },
        },
      });

      if (errors || !data || !data.updateViewerState) {
        if (errors) {
          showErrorDialog(...errors.map(({ message }) => message));
        } else {
          showErrorDialog('エラー');
        }
      }
    },
    [device],
  );

  return (
    <PageContainer title='コントロール'>
      <Controller onDispatch={handleDispatch} device={device} />
    </PageContainer>
  );
};
