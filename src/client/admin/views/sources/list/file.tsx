import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useGetFileSourcesSimpleQuery } from '../../../../api/generated/graphql';

export const FileSourceList = () => {
  const { loading, data, error } = useGetFileSourcesSimpleQuery({
    variables: { skip: 0, take: 10 },
  });
  if (loading) return <CircularProgress />;

  if (!data || error) return <p>error</p>;

  return (
    <>
      <Typography>{data.fileSources.total} 件</Typography>
      <List>
        {data.fileSources.sources.map(source => {
          return (
            <ListItem
              key={source.id}
              button
              component={Link}
              to={`/sources/file/${source.id}`}
            >
              <ListItemText
                primary={source.name}
                secondary={`${source.status}`}
              />
            </ListItem>
          );
        })}
      </List>
    </>
  );
};
