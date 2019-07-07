import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Add } from '@material-ui/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  RtmpStatus,
  useGetRtmpInputListSimpleQuery,
} from '../../../../api/generated/graphql';
import { useErrorSnack } from '../../../components/errors/ErrorSnackbar';
import { AddRtmpInputDialog } from '../../../components/sources/AddRtmpInputDialog';
import { useCommonStyles } from '../../../styles/common';

export const RtmpInputList = () => {
  const commonStyles = useCommonStyles();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const openErrorMessage = useErrorSnack();
  const { data, error, loading } = useGetRtmpInputListSimpleQuery({
    variables: { skip: 0, take: 10 },
    fetchPolicy: 'network-only',
  });

  if (loading) return <CircularProgress />;

  if (!data || error) {
    openErrorMessage(error ? error.message : '一覧の取得に失敗');
    return null;
  }

  const handleDialogClose = () => {
    setAddDialogOpen(false);
  };
  const handleDialogOpen = () => {
    setAddDialogOpen(true);
  };

  return (
    <>
      <Typography>{data.rtmpInputList.total} 件</Typography>
      <List>
        {data.rtmpInputList.inputs.map(input => {
          return (
            <ListItem
              key={input.id}
              button
              component={Link}
              to={`/sources/file/${input.id}`}
            >
              <ListItemText
                primary={input.name}
                secondary={input.status === RtmpStatus.Live ? '使用中' : ''}
              />
            </ListItem>
          );
        })}
      </List>
      <AddRtmpInputDialog
        open={addDialogOpen}
        handleClose={handleDialogClose}
      />
      <Fab
        className={commonStyles.fab}
        color='primary'
        onClick={handleDialogOpen}
      >
        <Add />
      </Fab>
    </>
  );
};
