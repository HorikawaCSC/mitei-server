import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { Edit } from '@material-ui/icons';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  SourceStatus,
  TranscodeStatus,
  useEnqueueTranscodeMutation,
  useGetFileSourceQuery,
  useProbeFileSourceMutation,
} from '../../../api/generated/graphql';
import { PresetSelect } from '../../../components/shared/PresetSelect';
import { FileDataDetails } from '../../../components/sources/FileDataDetails';
import { toStringDate } from '../../../utils/datetime';
import { transcodeStatusText } from '../../../utils/sources';

export const FileSourceDetails = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const fileId = match.params.id;
  const { data, loading } = useGetFileSourceQuery({
    variables: { id: fileId },
  });
  const probeFileSource = useProbeFileSourceMutation({
    errorPolicy: 'all',
    variables: { sourceId: fileId },
  });
  const enqueueTranscode = useEnqueueTranscodeMutation({
    errorPolicy: 'all',
  });
  const showError = useErrorDialog();
  const [presetId, setPresetId] = React.useState('');

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.fileSource) {
    return <p>error</p>;
  }

  const { fileSource: source } = data;
  const encodable =
    source.source.width &&
    source.status === TranscodeStatus.Pending &&
    source.source.status === SourceStatus.Available;

  const handleProbeFile = async () => {
    const { errors } = await probeFileSource();
    if (errors) {
      showError('エラー発生', errors[0].message);
    }
  };

  const handleEncode = async () => {
    const { errors } = await enqueueTranscode({
      variables: {
        sourceId: fileId,
        presetId,
      },
    });

    if (errors) {
      showError('エラー発生', errors[0].message);
    }
  };

  return (
    <>
      <PageContainer title={`ソース: ${source.name}`}>
        <Typography>
          ステータス: {transcodeStatusText[source.status]}
        </Typography>
        <Typography>
          エンコード後解像度:{' '}
          {source.width ? `${source.width}x${source.height}` : '不明'}
        </Typography>
        <Typography>作成日時: {toStringDate(source.createdAt)}</Typography>
        {encodable && (
          <>
            <PresetSelect value={presetId} handleChange={setPresetId} />
            <Button color='primary' onClick={handleEncode} disabled={!presetId}>
              <Typography component='span'>エンコード実行</Typography>
            </Button>
          </>
        )}
        <Button color='secondary'>
          <Edit />
          <Typography component='span'>名前の変更</Typography>
        </Button>
      </PageContainer>
      <FileDataDetails data={source} handleProbeFile={handleProbeFile} />
    </>
  );
};
