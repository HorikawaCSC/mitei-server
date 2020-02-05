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

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Edit } from '@material-ui/icons';
import { PageContainer, useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import {
  GetViewerDeviceQuery,
  useUpdateViewerNameMutation,
} from '../../../api/generated/graphql';
import { deviceType } from '../../../utils/viewers';
import { RenameSourceDialog } from '../../shared/RenameDialog';
import { OnlineBadge } from '../OnlineBadge';

type Props = { device: NonNullable<GetViewerDeviceQuery['viewerDevice']> };
export const SummarySection = ({ device }: Props) => {
  const [
    renameDevice,
    { loading: renameLoading },
  ] = useUpdateViewerNameMutation({
    errorPolicy: 'all',
  });
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const showErrorSnack = useErrorSnack();

  const handleShowRenameDialog = React.useCallback(() => {
    setRenameDialogOpen(true);
  }, [setRenameDialogOpen]);

  const handleCloseRenameDialog = React.useCallback(() => {
    setRenameDialogOpen(false);
  }, [setRenameDialogOpen]);

  const handleRename = React.useCallback(
    async (displayName: string) => {
      const { errors } = await renameDevice({
        variables: {
          id: device.id,
          displayName,
        },
      });

      if (errors) {
        showErrorSnack(errors[0].message);
        throw errors[0];
      }
    },
    [renameDevice, device],
  );

  return (
    <>
      <PageContainer title='概要'>
        <Typography>デバイス名: {device.displayName}</Typography>
        <Typography>デバイス種別: {deviceType[device.type]}</Typography>
        <Typography variant='h6'>ステータス</Typography>
        <OnlineBadge online={device.online} />
        <Button color='secondary' onClick={handleShowRenameDialog}>
          <Edit />
          <Typography component='span'>名前の変更</Typography>
        </Button>
      </PageContainer>
      <RenameSourceDialog
        open={renameDialogOpen}
        loading={renameLoading}
        onClose={handleCloseRenameDialog}
        onApply={handleRename}
        defaultName={device.displayName}
      />
    </>
  );
};
