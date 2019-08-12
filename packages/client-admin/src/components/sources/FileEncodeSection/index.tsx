import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import {
  GetFileSourceQuery,
  SourceStatus,
  TranscodeStatus,
  useEnqueueTranscodeMutation,
} from '../../../api/generated/graphql';
import { PresetSelect } from '../../shared/PresetSelect';

type Props = {
  source: NonNullable<GetFileSourceQuery['fileSource']>;
};

export const FileEncodeSection = ({ source }: Props) => {
  const enqueueTranscode = useEnqueueTranscodeMutation({
    errorPolicy: 'all',
  });
  const showError = useErrorDialog();
  const [presetId, setPresetId] = React.useState('');
  const [isRequested, setRequested] = React.useState(false);

  const encodable =
    source.source.width &&
    source.status === TranscodeStatus.Pending &&
    source.source.status === SourceStatus.Available;

  const handleEncode = async () => {
    setRequested(true);
    const { errors } = await enqueueTranscode({
      variables: {
        sourceId: source.id,
        presetId,
      },
    });

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
        <Typography component='p'>すでに変換済みです</Typography>
      )}
    </PageContainer>
  );
};
