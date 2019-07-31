import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Add, Delete } from '@material-ui/icons';
import * as React from 'react';
import {
  RtmpStatus,
  useGetRtmpInputListSimpleQuery,
  useRemoveRtmpInputMutation,
} from '../../../../client/api/generated/graphql';
import { useErrorDialog } from '../../../components/errors/ErrorDialog';
import { useErrorSnack } from '../../../components/errors/ErrorSnackbar';
import { AddRtmpInputDialog } from '../../../components/sources/AddRtmpInputDialog';
import { useCommonStyles } from '../../../styles/common';
import { rtmpInputSimpleString } from '../../../utils/sources';

export const RtmpInputList = () => {
  const commonStyles = useCommonStyles();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const openErrorMessage = useErrorSnack();
  const openErrorMessageDialog = useErrorDialog();
  const { data, error, loading, refetch } = useGetRtmpInputListSimpleQuery({
    variables: { skip: 0, take: 10 },
    fetchPolicy: 'network-only',
  });
  const removeRtmpInput = useRemoveRtmpInputMutation();

  if (loading) return <CircularProgress />;

  if (!data || error) {
    openErrorMessage(error ? error.message : '一覧の取得に失敗');
    return null;
  }

  const handleDialogClose = () => {
    setAddDialogOpen(false);

    refetch();
  };
  const handleDialogOpen = () => {
    setAddDialogOpen(true);
  };
  const createDeleteHandle = (id: string) => async () => {
    const { errors } = await removeRtmpInput({ variables: { id } });

    if (errors) {
      openErrorMessageDialog(errors[0].message);
    }

    refetch();
  };

  return (
    <>
      <Typography>{data.rtmpInputList.total} 件</Typography>
      <List>
        {data.rtmpInputList.inputs.map(input => {
          return (
            <ListItem key={input.id}>
              <ListItemText
                primary={input.name}
                secondary={rtmpInputSimpleString(input)}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge='end'
                  onClick={createDeleteHandle(input.id)}
                  disabled={input.status !== RtmpStatus.Unused}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
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
