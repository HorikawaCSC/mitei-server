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

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Add, Delete } from '@material-ui/icons';
import {
  PageContainer,
  useConfirmDialog,
  useMessageSnack,
} from '@mitei/client-common';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  GetChannelDetailQuery,
  GetSourcesSimpleQuery,
  TranscodeStatus,
  useAddFillerMutation,
  useRemoveFillerMutation,
} from '../../../api/generated/graphql';
import { useCommonStyles } from '../../../styles/common';
import { sourceSimpleString } from '../../../utils/sources';
import { SourceSelect } from '../../shared/SourceSelect';

export const FillerListSection = ({
  channel,
  refetch,
}: {
  channel: NonNullable<GetChannelDetailQuery['channel']>;
  refetch: () => Promise<unknown>;
}) => {
  const commonStyles = useCommonStyles();
  const [removeFiller] = useRemoveFillerMutation();
  const [addFiller] = useAddFillerMutation();
  const showMessageSnack = useMessageSnack();
  const [sourceId, setSourceId] = React.useState('');
  const confirm = useConfirmDialog();

  const createFillerDelete = (sourceId: string) => async () => {
    if (!(await confirm('確認', '削除しますか'))) return;
    await removeFiller({
      variables: { id: channel.id, source: sourceId },
    });
    showMessageSnack('削除しました');
    await refetch();
  };
  const addFillerHandle = async () => {
    await addFiller({
      variables: { id: channel.id, source: sourceId },
    });
    showMessageSnack('追加しました');
    await refetch();
  };
  const filterItem = (
    value: GetSourcesSimpleQuery['sourceList']['sources'][0],
  ) => {
    if (value.status !== TranscodeStatus.Success) return false;
    return !channel.fillerSources.map(source => source.id).includes(value.id);
  };

  const { fillerSources } = channel;
  return (
    <PageContainer title='フィラー一覧' mini>
      {fillerSources.length > 0 ? (
        <List>
          {fillerSources.map(source => (
            <ListItem
              key={source.id}
              button
              component={Link}
              to={`/sources/${source.type}/${source.id}`}
            >
              <ListItemText
                primary={source.name}
                secondary={sourceSimpleString(source)}
              />
              <ListItemSecondaryAction>
                <IconButton edge='end' onClick={createFillerDelete(source.id)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography component='p'>なし</Typography>
      )}
      <Typography component='p'>追加</Typography>
      <Box className={commonStyles.centerBox}>
        <SourceSelect
          value={sourceId}
          handleChange={setSourceId}
          filterItem={filterItem}
        />
        <Button
          color='primary'
          variant='contained'
          onClick={addFillerHandle}
          disabled={!sourceId}
        >
          <Add />
          <Typography>追加</Typography>
        </Button>
      </Box>
    </PageContainer>
  );
};
