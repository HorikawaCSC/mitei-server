import {
  Button,
  FormGroup,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';
import * as React from 'react';
import {
  useCreateFileSourceUploadMutation,
  useProbeFileSourceMutation,
  useUploadFileSourceChunkMutation,
} from '../../../../api/generated/graphql';
import { LabeledCheckbox } from '../../../../components/LabeledCheckbox';
import { FILE_UPLOAD_CHUNK } from '../../../../constant';
import { FileChooser } from '../../../components/shared/FileChooser';
import { PageContainer } from '../../../components/shared/PageContainer';

export const SourcesUpload = () => {
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [bufferProgress, setBufferProgress] = React.useState(0);
  const [probeFile, setProbeFile] = React.useState(true);
  const [file, setFile] = React.useState<File | null>(null);
  const createUpload = useCreateFileSourceUploadMutation();
  const uploadChunk = useUploadFileSourceChunkMutation();
  const probeFileSource = useProbeFileSourceMutation();

  const handleUpload = React.useCallback(async () => {
    if (!file) return;

    setUploading(true);

    const { data: sourceData, errors } = await createUpload({
      variables: {
        fileInfo: {
          filename: file.name,
          size: file.size,
        },
      },
    });
    if (errors || !sourceData) return;

    let uploadSuccess = false;
    for (let offset = 0; offset < file.size; offset += FILE_UPLOAD_CHUNK) {
      setBufferProgress((file.size / offset) * 100);

      const end = offset + Math.min(file.size - offset, FILE_UPLOAD_CHUNK);
      const blob = file.slice(offset, end);

      const { data: result } = await uploadChunk({
        variables: {
          file: {
            chunk: blob,
            size: end - offset,
            begin: offset,
          },
          sourceId: sourceData.createFileSourceUpload.id,
        },
      });

      setUploadProgress((file.size / end) * 100);

      if (!result) return;
      if (result.uploadFileSourceChunk) {
        uploadSuccess = true;
        break;
      }
    }
    if (uploadSuccess) {
      if (probeFile) {
        await probeFileSource({
          variables: { sourceId: sourceData.createFileSourceUpload.id },
        });
      }
      setUploading(false);
    }
  }, [file]);

  const handleFileChange = (input: File[]) => {
    setFile(input[0]);
  };

  const handleProbeFile = (_e: React.ChangeEvent<{}>, checked: boolean) => {
    setProbeFile(checked);
  };

  return (
    <PageContainer title='ソースアップロード'>
      <Typography component='p'>
        動画ファイルをアップロードして変換します。
      </Typography>
      <FormGroup>
        <FileChooser
          label='ソースファイル'
          fullWidth
          disabled={uploading}
          accept='.mp4, .ts, .m2ts, .mov, .flv, .mkv'
          onChange={handleFileChange}
        />
        <LabeledCheckbox
          color='primary'
          label='アップロード後にファイルを確認する'
          disabled={uploading}
          checked={probeFile}
          onChange={handleProbeFile}
        />
      </FormGroup>
      <Button
        color='primary'
        variant='contained'
        size='large'
        disabled={uploading}
        onClick={handleUpload}
      >
        <CloudUpload />
        <Typography component='span'>アップロード</Typography>
      </Button>

      {uploading ? (
        <LinearProgress
          color='primary'
          variant='buffer'
          valueBuffer={bufferProgress}
          value={uploadProgress}
        />
      ) : null}
    </PageContainer>
  );
};
