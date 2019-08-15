import { ExecutionResult } from '@apollo/react-common';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import {
  PageContainer,
  useErrorDialog,
  useMessageSnack,
} from '@mitei/client-common';
import * as React from 'react';
import {
  FillerControl,
  GetChannelDetailQuery,
  useUpdateChannelFillerControlMutation,
} from '../../../api/generated/graphql';
import { FillerModeSelect } from '../FillerModeSelect';

export const ChannelInfoSection = ({
  channel,
  refetch,
}: {
  channel: NonNullable<GetChannelDetailQuery['channel']>;
  refetch: () => Promise<unknown>;
}) => {
  const [updateFillerControl] = useUpdateChannelFillerControlMutation({
    errorPolicy: 'all',
  });
  const [fillerControl, setFillerControl] = React.useState(
    FillerControl.Random,
  );
  const [updating, setUpdating] = React.useState(false);
  const showMessage = useMessageSnack();
  const showErrorDialog = useErrorDialog();
  React.useEffect(() => setFillerControl(channel.fillerControl), [channel]);

  const handleFillerControlChange = async (value: FillerControl) => {
    setUpdating(true);
    const { errors } = (await updateFillerControl({
      variables: { id: channel.id, mode: value },
    })) as ExecutionResult<{}>;
    if (errors) {
      showErrorDialog(...errors.map(error => error.message));
      return;
    }
    showMessage('更新しました');
    await refetch();
    setUpdating(false);
  };

  return (
    <PageContainer title={`チャンネル: ${channel.displayName}`}>
      <Typography component='p'>ID: {channel.id}</Typography>
      <Box>
        <Typography component='p'>
          フィラー配信モード (変更はすぐに反映されません):
        </Typography>
        <FillerModeSelect
          value={fillerControl}
          onChange={handleFillerControlChange}
          disabled={updating}
        />
      </Box>
    </PageContainer>
  );
};
