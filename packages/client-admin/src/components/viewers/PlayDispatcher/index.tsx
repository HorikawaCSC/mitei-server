import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import * as React from 'react';
import {
  GetSourcesSimpleQuery,
  TranscodeStatus,
  ViewerRequestParam,
  ViewerRequestType,
  ViewerSourceType,
} from '../../../api/generated/graphql';
import { ChannelSelect } from '../../shared/ChannelSelect';
import { SourceSelect } from '../../shared/SourceSelect';

type Props = {
  onDispatch: (request: Omit<ViewerRequestParam, 'device'>) => void;
};
export const PlayDispatcher = (props: Props) => {
  const [sourceType, setSourceType] = React.useState<ViewerSourceType>(
    ViewerSourceType.Channel,
  );
  const handleSourceTypeChange = React.useCallback(
    (_e, value: string) => {
      setSourceType(value as ViewerSourceType);
    },
    [sourceType],
  );

  const [sourceId, setSourceId] = React.useState('');
  const filterItem = (
    value: GetSourcesSimpleQuery['sourceList']['sources'][0],
  ) => value.status === TranscodeStatus.Success;

  const dispatch = React.useCallback(() => {
    props.onDispatch({
      type: ViewerRequestType.Play,
      sourceType,
      sourceId,
    });
  }, [sourceType, sourceId, props]);

  return (
    <Box>
      <FormGroup>
        <FormLabel>ソース</FormLabel>
        <RadioGroup value={sourceType} onChange={handleSourceTypeChange}>
          <FormControlLabel
            value={ViewerSourceType.Channel}
            label='チャンネル'
            control={<Radio />}
          />
          <FormControlLabel
            value={ViewerSourceType.Source}
            label='ファイル/録画'
            control={<Radio />}
          />
        </RadioGroup>
        {sourceType === ViewerSourceType.Channel ? (
          <ChannelSelect value={sourceId} handleChange={setSourceId} />
        ) : (
          <SourceSelect
            value={sourceId}
            handleChange={setSourceId}
            filterItem={filterItem}
          />
        )}
        <Button variant='contained' size='large' onClick={dispatch}>
          実行
        </Button>
      </FormGroup>
    </Box>
  );
};
