import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { useAddRtmpInputMutation } from '../../../api/generated/graphql';

type Props = { open: boolean; handleClose: () => void };
export const AddRtmpInputDialog = (props: Props) => {
  const addRtmpInput = useAddRtmpInputMutation();
  const showErrorMessage = useErrorSnack();

  const [name, setName] = React.useState('');

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleAddClick = async () => {
    const { data, errors } = await addRtmpInput({
      variables: { name, presetId: '' },
    });

    if (errors || !data || !data.createRtmpInput) {
      showErrorMessage(errors ? errors[0].message : '作成に失敗しました');
      return;
    }

    setName('');
    props.handleClose();
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
        />
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={props.handleClose}>
          キャンセル
        </Button>
        <Button color='primary' onClick={handleAddClick} disabled={name === ''}>
          追加
        </Button>
      </DialogActions>
    </Dialog>
  );
};
