import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView, routes } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  TranscodeStatus,
  useGetFileSourceQuery,
} from '../../../api/generated/graphql';
import { PreviewSection } from '../../../components/shared/PreviewSection';
import { FileDataDetails } from '../../../components/sources/FileDataDetails';
import { FileEncodeSection } from '../../../components/sources/FileEncodeSection';
import { SourceDetails } from '../../../components/sources/SourceDetails';

export const FileSourceDetails = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const fileId = match.params.id;
  const { data, loading, error } = useGetFileSourceQuery({
    variables: { id: fileId },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.fileSource || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { fileSource: source } = data;

  return (
    <>
      <SourceDetails source={source} />
      <FileEncodeSection source={source} />
      {source.status === TranscodeStatus.Success && (
        <PreviewSection source={routes.media.source(source.id)} />
      )}
      <FileDataDetails source={source} />
    </>
  );
};
