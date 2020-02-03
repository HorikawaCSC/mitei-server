import { ExecutionResult } from '@apollo/react-common';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { Add, Delete } from '@material-ui/icons';
import {
  NotFoundView,
  useConfirmDialog,
  useErrorDialog,
} from '@mitei/client-common';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import {
  RtmpStatus,
  useGetRtmpInputListSimpleQuery,
  useRemoveRtmpInputMutation,
} from '../../../api/generated/graphql';
import { TotalCount } from '../../../components/shared/TotalCount';
import { AddRtmpInputDialog } from '../../../components/sources/AddRtmpInputDialog';
import { useCommonStyles } from '../../../styles/common';
import { rtmpInputSimpleWithUrlString } from '../../../utils/sources';

export const RtmpInputList = () => {
  const commonStyles = useCommonStyles();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const openErrorMessageDialog = useErrorDialog();
  const {
    data,
    error,
    loading,
    refetch,
    fetchMore,
  } = useGetRtmpInputListSimpleQuery({
    variables: { skip: 0, take: 10 },
    fetchPolicy: 'network-only',
  });
  const [removeRtmpInput] = useRemoveRtmpInputMutation();
  const [scrollRef, inView] = useInView();
  const confirm = useConfirmDialog();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { inputs } = data.rtmpInputList;
      fetchMore({
        variables: {
          skip: inputs.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            rtmpInputList: {
              total: fetchMoreResult.rtmpInputList.total,
              inputs: [
                ...prev.rtmpInputList.inputs,
                ...fetchMoreResult.rtmpInputList.inputs,
              ],
              __typename: prev.rtmpInputList.__typename,
            },
          };
        },
      });
    }
  }, [inView]);

  if (loading) return <CircularProgress />;

  if (!data || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const handleDialogClose = () => {
    setAddDialogOpen(false);

    refetch();
  };

  const handleDialogOpen = () => {
    setAddDialogOpen(true);
  };

  const createDeleteHandle = (id: string) => async () => {
    if (!(await confirm('確認', '削除しますか'))) return;

    const { errors } = (await removeRtmpInput({
      variables: { id },
    })) as ExecutionResult<{}>;

    if (errors) {
      openErrorMessageDialog(errors[0].message);
    }

    refetch();
  };

  const { inputs, total } = data.rtmpInputList;
  const hasMore = total > inputs.length;
  return (
    <>
      <TotalCount count={total} />
      <List>
        {inputs.map(input => {
          return (
            <ListItem key={input.id}>
              <ListItemText
                primary={input.name}
                secondary={rtmpInputSimpleWithUrlString(input)}
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
        {hasMore && <div ref={scrollRef} />}
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
