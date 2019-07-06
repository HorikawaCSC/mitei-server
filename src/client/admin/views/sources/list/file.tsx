import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { CloudUpload } from '@material-ui/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useGetFileSourcesSimpleQuery } from '../../../../api/generated/graphql';
import { useErrorSnack } from '../../../components/shared/ErrorSnackbar';
import { useCommonStyles } from '../../../styles/common';

export const FileSourceList = () => {
  const commonStyles = useCommonStyles();
  const { loading, data, error } = useGetFileSourcesSimpleQuery({
    variables: { skip: 0, take: 10 },
  });
  const openErrorMessage = useErrorSnack();

  if (loading) return <CircularProgress />;

  if (!data || error) {
    openErrorMessage('Failed to get file sources');
    return null;
  }

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
      <Fab
        component={Link}
        to='/sources/file/upload'
        className={commonStyles.fab}
        color='primary'
      >
        <CloudUpload />
      </Fab>
    </>
  );
};
