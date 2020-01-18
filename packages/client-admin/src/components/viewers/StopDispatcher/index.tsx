import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import * as React from 'react';
import {
  ViewerRequestParam,
  ViewerRequestType,
} from '../../../api/generated/graphql';

type Props = {
  onDispatch: (request: Omit<ViewerRequestParam, 'device'>) => void;
  currentVolume?: number;
};

export const StopDispatcher = (props: Props) => {
  const dispatch = React.useCallback(() => {
    props.onDispatch({
      type: ViewerRequestType.Stop,
    });
  }, [props]);
  return (
    <Box>
      <FormGroup>
        <FormLabel>停止</FormLabel>
        <Button variant='contained' size='large' onClick={dispatch}>
          実行
        </Button>
      </FormGroup>
    </Box>
  );
};
