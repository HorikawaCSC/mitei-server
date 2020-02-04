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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import {
  CreateChannelSimpleMutation,
  useCreateChannelSimpleMutation,
} from '../../../api/generated/graphql';

type Props = { open: boolean; handleClose: () => void };
export const AddChannelDialog = (props: Props) => {
  const [createChannel] = useCreateChannelSimpleMutation();
  const showErrorMessage = useErrorSnack();

  const [displayName, setDisplayName] = React.useState('');
  const [channelId, setChannelId] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleChangeDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };

  const handleChangeChannelId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannelId(e.target.value);
  };

  const handleClose = () => {
    setChannelId('');
    setDisplayName('');
    props.handleClose();
  };

  const handleAddClick = async () => {
    setLoading(true);

    const { data, errors } = (await createChannel({
      variables: { displayName, id: channelId },
    })) as ExecutionResult<CreateChannelSimpleMutation>;

    setLoading(false);

    if (errors || !data || !data.createChannel) {
      showErrorMessage(errors ? errors[0].message : '作成に失敗しました');
      return;
    }

    handleClose();
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>新しいチャンネルを追加</DialogTitle>
      <DialogContent>
        <TextField
          placeholder='ID'
          value={channelId}
          onChange={handleChangeChannelId}
          fullWidth
        />
        <TextField
          placeholder='表示名'
          value={displayName}
          onChange={handleChangeDisplayName}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={handleClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          color='primary'
          onClick={handleAddClick}
          disabled={displayName === '' || channelId === '' || loading}
        >
          追加
        </Button>
      </DialogActions>
    </Dialog>
  );
};
