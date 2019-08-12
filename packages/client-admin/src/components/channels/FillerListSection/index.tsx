import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { GetChannelDetailQuery } from '../../../api/generated/graphql';
import { sourceSimpleString } from '../../../utils/sources';

export const FillerListSection = ({
  channel,
}: {
  channel: NonNullable<GetChannelDetailQuery['channel']>;
}) => {
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
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography component='p'>なし</Typography>
      )}
    </PageContainer>
  );
};
