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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onApply: (name: string) => void | Promise<void>;
  defaultName: string;
};
export const RenameSourceDialog = (props: Props) => {
  const [name, setName] = React.useState(props.defaultName);

  React.useEffect(() => setName(props.defaultName), [
    props.defaultName,
    props.open,
  ]);

  const handleChangeName = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    [setName],
  );

  const handleClose = React.useCallback(() => {
    setName('');
    props.onClose();
  }, [setName, props.onClose]);

  const handleChangeClick = React.useCallback(async () => {
    await props.onApply(name);
    props.onClose();
  }, [name, props.onApply, props.onClose]);

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>名前を変更: {props.defaultName}</DialogTitle>
      <DialogContent>
        <TextField
          placeholder='名前'
          value={name}
          onChange={handleChangeName}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button
          color='primary'
          onClick={handleClose}
          disabled={!!props.loading}
        >
          キャンセル
        </Button>
        <Button
          color='primary'
          onClick={handleChangeClick}
          disabled={name === '' || !!props.loading}
        >
          変更
        </Button>
      </DialogActions>
    </Dialog>
  );
};
