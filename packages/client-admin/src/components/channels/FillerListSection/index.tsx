import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Delete } from '@material-ui/icons';
import { PageContainer, useMessageSnack } from '@mitei/client-common';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  GetChannelDetailQuery,
  useRemoveFillerMutation,
} from '../../../api/generated/graphql';
import { sourceSimpleString } from '../../../utils/sources';

export const FillerListSection = ({
  channel,
  refetch,
}: {
  channel: NonNullable<GetChannelDetailQuery['channel']>;
  refetch: () => Promise<unknown>;
}) => {
  const removeFiller = useRemoveFillerMutation({ errorPolicy: 'all' });
  const showMessageSnack = useMessageSnack();
  const createFillerDelete = (sourceId: string) => async () => {
    await removeFiller({
      variables: { id: channel.id, source: sourceId },
    });
    showMessageSnack('削除しました');
    await refetch();
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
    </PageContainer>
  );
};
