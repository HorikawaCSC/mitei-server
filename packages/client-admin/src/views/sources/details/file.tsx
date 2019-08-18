import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useGetFileSourceQuery } from '../../../api/generated/graphql';
import { FileDataDetails } from '../../../components/sources/FileDataDetails';
import { FileEncodeSection } from '../../../components/sources/FileEncodeSection';
import { PreviewSection } from '../../../components/sources/PreviewSection';
import { SourceDetails } from '../../../components/sources/SourceDetails';

export const FileSourceDetails = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const fileId = match.params.id;
  const { data, loading, error } = useGetFileSourceQuery({
    variables: { id: fileId },
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
      <PreviewSection source={source} />
      <FileDataDetails source={source} />
    </>
  );
};
