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
import { Duration } from 'luxon';
import * as React from 'react';
import {
  TranscodeStatus,
  useRenameSourceMutation,
} from '../../../api/generated/graphql';
import { toStringDate } from '../../../utils/datetime';
import { transcodeStatusText } from '../../../utils/sources';
import { RenameSourceDialog } from '../../shared/RenameDialog';

type Props = {
  source: {
    id: string;
    status: TranscodeStatus;
    width?: number | null;
    height?: number | null;
    name: string;
    createdAt: string;
    duration?: number | null;
    preset?: {
      name: string;
    };
  };
};

export const SourceDetails = (props: Props) => {
  const { source } = props;
  const [renameSource, { loading: renameLoading }] = useRenameSourceMutation({
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
    async (name: string) => {
      const { errors } = await renameSource({
        variables: {
          id: source.id,
          name,
        },
      });

      if (errors) {
        showErrorSnack(errors[0].message);
        throw errors[0];
      }
    },
    [renameSource, source],
  );

  return (
    <>
      <PageContainer title={`ソース: ${source.name}`}>
        <Typography>
          ステータス: {transcodeStatusText[source.status]}
        </Typography>
        <Typography>
          解像度: {source.width ? `${source.width}x${source.height}` : '不明'}
        </Typography>
        <Typography>
          長さ:{' '}
          {source.duration
            ? Duration.fromMillis(source.duration * 1000).toFormat('hh:mm:ss')
            : '不明'}
        </Typography>
        <Typography>作成日時: {toStringDate(source.createdAt)}</Typography>
        {source.preset && (
          <Typography>変換設定: {source.preset.name}</Typography>
        )}
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
        defaultName={source.name}
      />
    </>
  );
};
