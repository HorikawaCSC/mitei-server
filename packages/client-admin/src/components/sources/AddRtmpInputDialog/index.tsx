import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { useAddRtmpInputMutation } from '../../../api/generated/graphql';
import { PresetSelect } from '../../shared/PresetSelect';

type Props = { open: boolean; handleClose: () => void };
export const AddRtmpInputDialog = (props: Props) => {
  const addRtmpInput = useAddRtmpInputMutation();
  const showErrorMessage = useErrorSnack();

  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [presetId, setPresetId] = React.useState('');

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleClose = () => {
    setName('');
    setLoading(false);
    props.handleClose();
  };

  const handleAddClick = async () => {
    setLoading(true);

    const { data, errors } = await addRtmpInput({
      variables: { name, presetId },
      errorPolicy: 'all',
    });

    setLoading(false);

    if (errors || !data || !data.createRtmpInput) {
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
      <DialogTitle>RTMP入力を追加</DialogTitle>
      <DialogContent>
        <TextField
          placeholder='名前'
          value={name}
          onChange={handleChangeName}
          fullWidth
          disabled={loading}
        />
        <PresetSelect
          value={presetId}
          handleChange={setPresetId}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={handleClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          color='primary'
          onClick={handleAddClick}
          disabled={name === '' || loading}
        >
          追加
        </Button>
      </DialogActions>
    </Dialog>
  );
};
