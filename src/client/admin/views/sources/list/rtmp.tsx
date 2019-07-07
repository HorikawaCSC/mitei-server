import Fab from '@material-ui/core/Fab';
import { Add } from '@material-ui/icons';
import * as React from 'react';
import { AddRtmpInputDialog } from '../../../components/sources/AddRtmpInputDialog';
import { useCommonStyles } from '../../../styles/common';

export const RtmpInputList = () => {
  const commonStyles = useCommonStyles();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  const handleDialogClose = () => {
    setAddDialogOpen(false);
  };
  const handleDialogOpen = () => {
    setAddDialogOpen(true);
  };
  return (
    <>
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
