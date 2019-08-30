import { ExecutionResult } from '@apollo/react-common';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import {
  GetFileSourceQuery,
  SourceStatus,
  TranscodeStatus,
  useEnqueueTranscodeMutation,
  useGetFileTranscodeStatusQuery,
} from '../../../api/generated/graphql';
import { PresetSelect } from '../../shared/PresetSelect';

type Props = {
  source: NonNullable<GetFileSourceQuery['fileSource']>;
};

export const FileEncodeSection = ({ source }: Props) => {
  const [enqueueTranscode] = useEnqueueTranscodeMutation();
  const { startPolling, stopPolling } = useGetFileTranscodeStatusQuery({
    variables: { id: source.id },
  });
  const showError = useErrorDialog();
  const [presetId, setPresetId] = React.useState('');
  const [isRequested, setRequested] = React.useState(false);

  const encodable =
    source.source.width &&
    (source.status === TranscodeStatus.Pending ||
      source.status === TranscodeStatus.Failed) &&
    source.source.status === SourceStatus.Available;

  React.useEffect(() => {
    if (
      source.status !== TranscodeStatus.Running &&
      source.status !== TranscodeStatus.Waiting
    ) {
      stopPolling();
    }
  }, [source]);

  const handleEncode = async () => {
    setRequested(true);
    startPolling(100);
    const { errors } = (await enqueueTranscode({
      variables: {
        sourceId: source.id,
        presetId,
      },
    })) as ExecutionResult<{}>;

    if (errors) {
      showError('エラー発生', errors[0].message);
      setRequested(false);
    }
  };

  return (
    <PageContainer title='エンコード' mini>
      {encodable ? (
        <>
          <PresetSelect
            value={presetId}
            handleChange={setPresetId}
            disabled={isRequested}
          />
          <Button
            color='primary'
            onClick={handleEncode}
            disabled={!presetId || isRequested}
          >
            <Typography component='span'>
              {isRequested ? 'お待ち下さい' : 'エンコード実行'}
            </Typography>
          </Button>
        </>
      ) : (
        <Typography component='p'>
          {source.status === TranscodeStatus.Waiting
            ? '変換待機中です'
            : source.status === TranscodeStatus.Running
            ? `変換中です (${source.transcodeProgress || 0}%)`
            : source.status === TranscodeStatus.Success
            ? '変換済みです'
            : 'ファイル内容不明です'}
        </Typography>
      )}
    </PageContainer>
  );
};
