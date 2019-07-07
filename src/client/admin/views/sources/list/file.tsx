import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Publish } from '@material-ui/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useGetFileSourcesSimpleQuery } from '../../../../api/generated/graphql';
import { useErrorSnack } from '../../../components/errors/ErrorSnackbar';
import { useCommonStyles } from '../../../styles/common';
import { fileSourceSimpleDetailString } from '../../../utils/sources';

export const FileSourceList = () => {
  const commonStyles = useCommonStyles();
  const { loading, data, error } = useGetFileSourcesSimpleQuery({
    variables: { skip: 0, take: 10 },
    fetchPolicy: 'no-cache',
  });
  const openErrorMessage = useErrorSnack();

  if (loading) return <CircularProgress />;

  if (!data || error) {
    openErrorMessage(error ? error.message : 'ファイル一覧の取得に失敗');
    return null;
  }

  return (
    <>
      <Typography>{data.fileSourceList.total} 件</Typography>
      <List>
        {data.fileSourceList.sources.map(source => {
          return (
            <ListItem
              key={source.id}
              button
              component={Link}
              to={`/sources/file/${source.id}`}
            >
              <ListItemText
                primary={source.name}
                secondary={fileSourceSimpleDetailString(source)}
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
        <Publish />
      </Fab>
    </>
  );
};
