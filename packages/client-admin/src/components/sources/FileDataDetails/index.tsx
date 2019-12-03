import { ExecutionResult } from '@apollo/react-common';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import { Duration } from 'luxon';
import * as React from 'react';
import {
  GetFileSourceQuery,
  ProbeFileSourceMutation,
  SourceStatus,
  useProbeFileSourceMutation,
} from '../../../api/generated/graphql';
import { convertFileSize } from '../../../utils/filesize';
import { fileStatusText } from '../../../utils/sources';

export const FileDataDetails = ({
  source,
}: {
  source: NonNullable<GetFileSourceQuery['fileSource']>;
}) => {
  const showError = useErrorDialog();
  const [probeFileSource] = useProbeFileSourceMutation({
    variables: { sourceId: source.id },
  });
  const [isProbeRequested, setProbeRequested] = React.useState(
    source.isProbing,
  );

  const handleProbeFile = async () => {
    setProbeRequested(true);
    const { errors } = (await probeFileSource()) as ExecutionResult<
      ProbeFileSourceMutation
    >;
    if (errors) {
      showError('エラー発生', errors[0].message);
      setProbeRequested(false);
    }
  };

  const probable =
    !source.source.width && source.source.status === SourceStatus.Available;
  const fileSize = convertFileSize(source.source.fileSize);

  return (
    <PageContainer title='元データ' mini>
      <Typography>
        ステータス: {fileStatusText[source.source.status]}
      </Typography>
      <Typography>
        解像度:{' '}
        {source.source.width
          ? `${source.source.width}x${source.source.height}`
          : '不明'}
      </Typography>
      <Typography>
        長さ:{' '}
        {source.source.duration
          ? Duration.fromMillis(source.source.duration * 1000).toFormat(
              'hh:mm:ss',
            )
          : '不明'}
      </Typography>
      <Typography>
        ファイル情報: {source.source.extension} / {fileSize}
      </Typography>
      {probable ? (
        <Button
          color='primary'
          onClick={handleProbeFile}
          disabled={isProbeRequested}
        >
          <Typography component='span'>
            {isProbeRequested ? 'お待ち下さい' : 'ファイル内容の読み取り'}
          </Typography>
        </Button>
      ) : null}
    </PageContainer>
  );
};
