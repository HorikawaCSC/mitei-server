import { ExecutionResult } from '@apollo/react-common';
import {
  Button,
  FormGroup,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';
import {
  LabeledCheckbox,
  PageContainer,
  useErrorDialog,
} from '@mitei/client-common';
import * as React from 'react';
import useRouter from 'use-react-router';
import {
  CreateFileSourceUploadMutation,
  UploadFileSourceChunkMutation,
  useCreateFileSourceUploadMutation,
  useProbeFileSourceMutation,
  useUploadFileSourceChunkMutation,
} from '../../../api/generated/graphql';
import { FileChooser } from '../../../components/shared/FileChooser';
import { FILE_UPLOAD_CHUNK } from '../../../constant';

export const FileSourceUploadView = () => {
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [bufferProgress, setBufferProgress] = React.useState(0);
  const [probeFile, setProbeFile] = React.useState(true);
  const [file, setFile] = React.useState<File | null>(null);
  const [createUpload] = useCreateFileSourceUploadMutation();
  const [uploadChunk] = useUploadFileSourceChunkMutation();
  const [probeFileSource] = useProbeFileSourceMutation();
  const openErrorMessage = useErrorDialog();
  const { history } = useRouter();

  const handleUpload = React.useCallback(async () => {
    if (!file) return;

    setUploading(true);

    const { data: sourceData, errors } = (await createUpload({
      variables: {
        fileInfo: {
          filename: file.name,
          size: file.size,
        },
      },
    })) as ExecutionResult<CreateFileSourceUploadMutation>;
    if (errors || !sourceData) {
      openErrorMessage(
        errors ? errors[0].message : 'アップロードを開始できません',
      );
      return;
    }

    const sourceId = sourceData.createFileSourceUpload.id;

    let uploadSuccess = false;
    for (let offset = 0; offset < file.size; offset += FILE_UPLOAD_CHUNK) {
      const end = offset + Math.min(file.size - offset, FILE_UPLOAD_CHUNK);

      setBufferProgress((end / file.size) * 100);

      const blob = file.slice(offset, end);

      const { data: result, errors } = (await uploadChunk({
        variables: {
          file: {
            chunk: blob,
            size: end - offset,
            begin: offset,
          },
          sourceId,
        },
      })) as ExecutionResult<UploadFileSourceChunkMutation>;

      setUploadProgress((end / file.size) * 100);

      if (!result || errors) {
        openErrorMessage(errors ? errors[0].message : 'アップロード失敗');
        return;
      }

      if (result.uploadFileSourceChunk) {
        uploadSuccess = true;
        break;
      }
    }
    if (uploadSuccess) {
      if (probeFile) {
        const { errors } = (await probeFileSource({
          variables: { sourceId },
        })) as ExecutionResult<{}>;
        if (errors) {
          openErrorMessage(
            errors ? errors[0].message : 'ファイル確認処理を開始できません',
          );
          return;
        }
      }
      setUploading(false);
      history.push(`/sources/file/${sourceId}`);
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
        disabled={uploading || !file}
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
