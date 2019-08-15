import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Add, Delete } from '@material-ui/icons';
import { PageContainer, useMessageSnack } from '@mitei/client-common';
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
  const [removeFiller] = useRemoveFillerMutation({ errorPolicy: 'all' });
  const [addFiller] = useAddFillerMutation({ errorPolicy: 'all' });
  const showMessageSnack = useMessageSnack();
  const [sourceId, setSourceId] = React.useState('');

  const createFillerDelete = (sourceId: string) => async () => {
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
