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
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {
  PageContainer,
  useErrorDialog,
  useMessageSnack,
} from '@mitei/client-common';
import * as React from 'react';
import { useAddTranscodePresetMutation } from '../../../api/generated/graphql';
import { parameterString } from '../../../utils/parameter';

const useStyles = makeStyles(theme =>
  createStyles({
    button: {
      margin: theme.spacing(1, 0, 0, 0),
    },
  }),
);

type Props = { refetch: () => Promise<unknown> };
export const AddPresetSection = ({ refetch }: Props) => {
  const [addPreset] = useAddTranscodePresetMutation();
  const [name, setName] = React.useState('');
  const [parameter, setParameter] = React.useState('');
  const styles = useStyles();
  const showError = useErrorDialog();
  const showMessage = useMessageSnack();

  const handleNameChange = React.useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setName(e.target.value as string);
    },
    [name],
  );

  const handleParamChange = React.useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setParameter(e.target.value as string);
    },
    [name],
  );

  const handleReset = React.useCallback(() => {
    setName('');
    setParameter('');
  }, [name, parameter]);

  const handleAdd = React.useCallback(async () => {
    const { errors } = (await addPreset({
      variables: {
        name,
        parameter: parameter.split(/[\r\n]+/),
      },
    })) as ExecutionResult;

    if (errors) {
      showError(...errors.map(error => error.message));
      return;
    }

    showMessage('追加しました');
    refetch();
    handleReset();
  }, [name, parameter]);

  const actualParam = React.useMemo(
    () => parameterString(parameter.split(/[\r\n]+/)),
    [parameter],
  );

  const disabled = React.useMemo(() => !name || !parameter, [name, parameter]);

  return (
    <PageContainer title='プリセット追加'>
      <TextField
        value={name}
        onChange={handleNameChange}
        label='名前'
        fullWidth
      />
      <TextField
        value={parameter}
        onChange={handleParamChange}
        label='パラメーター(FFmpeg)'
        fullWidth
        multiline
        rows={3}
        rowsMax={15}
      />
      <Typography component='p'>実際のパラメータ: {actualParam}</Typography>
      <Button
        color='primary'
        variant='contained'
        disabled={disabled}
        className={styles.button}
        onClick={handleAdd}
      >
        追加
      </Button>
    </PageContainer>
  );
};
