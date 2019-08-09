import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { Edit } from '@material-ui/icons';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  TranscodeStatus,
  useGetFileSourceQuery,
  useProbeFileSourceMutation,
} from '../../../api/generated/graphql';
import { FileDataDetails } from '../../../components/sources/FileDataDetails';
import { transcodeStatusText } from '../../../utils/sources';

export const FileSourceDetails = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const fileId = match.params.id;
  const { data, loading } = useGetFileSourceQuery({
    variables: { id: fileId },
  });
  const probeFileSource = useProbeFileSourceMutation({ errorPolicy: 'all' });
  const showError = useErrorDialog();

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.fileSource) {
    return <p>error</p>;
  }

  const { fileSource: source } = data;
  const encodable =
    source.source.width && source.status === TranscodeStatus.Pending;

  const handleProbeFile = async () => {
    const { errors } = await probeFileSource({
      variables: { sourceId: fileId },
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
        {encodable ? (
          <Button color='primary'>
            <Typography component='span'>エンコード実行</Typography>
          </Button>
        ) : null}
        <Button color='secondary'>
          <Edit />
          <Typography component='span'>名前の変更</Typography>
        </Button>
      </PageContainer>
      <FileDataDetails data={source} handleProbeFile={handleProbeFile} />
    </>
  );
};
