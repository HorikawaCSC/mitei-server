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

import { ExecutionResult } from '@apollo/react-common';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Edit } from '@material-ui/icons';
import {
  PageContainer,
  useErrorDialog,
  useErrorSnack,
  useMessageSnack,
} from '@mitei/client-common';
import * as React from 'react';
import {
  FillerControl,
  GetChannelDetailQuery,
  useUpdateChannelFillerControlMutation,
  useUpdateChannelNameMutation,
} from '../../../api/generated/graphql';
import { RenameSourceDialog } from '../../shared/RenameDialog';
import { FillerModeSelect } from '../FillerModeSelect';

export const ChannelInfoSection = ({
  channel,
  refetch,
}: {
  channel: NonNullable<GetChannelDetailQuery['channel']>;
  refetch: () => Promise<unknown>;
}) => {
  const [updateFillerControl] = useUpdateChannelFillerControlMutation();
  const [fillerControl, setFillerControl] = React.useState(
    FillerControl.Random,
  );
  const [updating, setUpdating] = React.useState(false);
  const showMessage = useMessageSnack();
  const showErrorDialog = useErrorDialog();
  const [
    renameChannel,
    { loading: renameLoading },
  ] = useUpdateChannelNameMutation({
    errorPolicy: 'all',
  });
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);

  React.useEffect(() => setFillerControl(channel.fillerControl), [channel]);

  const showErrorSnack = useErrorSnack();

  const handleFillerControlChange = async (value: FillerControl) => {
    setUpdating(true);
    const { errors } = (await updateFillerControl({
      variables: { id: channel.id, mode: value },
    })) as ExecutionResult<{}>;
    if (errors) {
      showErrorDialog(...errors.map(error => error.message));
      return;
    }
    showMessage('更新しました');
    await refetch();
    setUpdating(false);
  };

  const handleShowRenameDialog = React.useCallback(() => {
    setRenameDialogOpen(true);
  }, [setRenameDialogOpen]);

  const handleCloseRenameDialog = React.useCallback(() => {
    setRenameDialogOpen(false);
  }, [setRenameDialogOpen]);

  const handleRename = React.useCallback(
    async (name: string) => {
      const { errors } = await renameChannel({
        variables: {
          id: channel.id,
          name,
        },
      });

      if (errors) {
        showErrorSnack(errors[0].message);
        throw errors[0];
      }
    },
    [renameChannel, channel],
  );

  return (
    <>
      <PageContainer title={`チャンネル: ${channel.displayName}`}>
        <Typography component='p'>ID: {channel.id}</Typography>
        <Box>
          <Typography component='p'>
            フィラー配信モード (変更はすぐに反映されません):
          </Typography>
          <FillerModeSelect
            value={fillerControl}
            onChange={handleFillerControlChange}
            disabled={updating}
          />
        </Box>
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
        defaultName={channel.displayName}
      />
    </>
  );
};
