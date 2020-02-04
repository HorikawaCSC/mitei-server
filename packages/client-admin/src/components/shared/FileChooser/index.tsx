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

import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  Theme,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import * as React from 'react';
import { convertFileSize } from '../../../utils/filesize';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputOuter: {
      display: 'flex',
      flexDirection: 'row',
      marginTop: '16px',
    },
    input: {
      cursor: 'default',
    },
    inputNoSelect: {
      color: theme.palette.grey[700],
    },
    fileInput: {
      display: 'none',
    },
  }),
);

type Props = {
  accept?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  multiple?: boolean;
  error?: boolean;
  onChange?: (files: File[]) => void;
};

export const FileChooser = (props: Props) => {
  const styles = useStyles();

  const [selected, setSelected] = React.useState(false);
  const [filename, setFilename] = React.useState('');
  const inputRef = React.createRef<HTMLInputElement>();

  const handleFileChange = () => {
    if (!inputRef.current) return;

    const { files } = inputRef.current;
    if (files && files.length > 0) {
      const filesArray: File[] = [].slice.apply(files);

      setSelected(true);
      setFilename(
        filesArray
          .map(file => `${file.name} (${convertFileSize(file.size)})`)
          .join(', '),
      );

      if (props.onChange) {
        props.onChange(filesArray);
      }
    } else {
      setSelected(false);
    }
  };

  return (
    <Box>
      <FormControl fullWidth={props.fullWidth}>
        <InputLabel error={props.error} disabled={props.disabled}>
          {props.label}
        </InputLabel>
        <div className={styles.inputOuter}>
          <Input
            value={selected ? filename : '選択なし'}
            placeholder={props.placeholder}
            disabled={props.disabled}
            fullWidth={props.fullWidth}
            readOnly
            error={props.error}
            className={clsx(styles.input, {
              [styles.inputNoSelect]: !selected,
            })}
          />
          <Button component='label' size='small' disabled={props.disabled}>
            参照
            <input
              type='file'
              accept={props.accept}
              className={styles.fileInput}
              disabled={props.disabled}
              onChange={handleFileChange}
              multiple={props.multiple}
              ref={inputRef}
            />
          </Button>
        </div>
      </FormControl>
    </Box>
  );
};
