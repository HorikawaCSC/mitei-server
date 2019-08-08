import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { useCreateChannelSimpleMutation } from '../../../api/generated/graphql';

type Props = { open: boolean; handleClose: () => void };
export const AddChannelDialog = (props: Props) => {
  const createChannel = useCreateChannelSimpleMutation({ errorPolicy: 'all' });
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

    const { data, errors } = await createChannel({
      variables: { displayName, id: channelId },
      errorPolicy: 'all',
    });

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
