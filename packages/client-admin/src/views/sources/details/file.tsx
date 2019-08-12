import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useGetFileSourceQuery } from '../../../api/generated/graphql';
import { FileDataDetails } from '../../../components/sources/FileDataDetails';
import { FileEncodeSection } from '../../../components/sources/FileEncodeSection';
import { SourceDetails } from '../../../components/sources/SourceDetails';

export const FileSourceDetails = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const fileId = match.params.id;
  const { data, loading } = useGetFileSourceQuery({
    variables: { id: fileId },
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.fileSource) {
    return <p>error</p>;
  }

  const { fileSource: source } = data;

  return (
    <>
      <SourceDetails source={source} />
      <FileEncodeSection source={source} />
      <FileDataDetails source={source} />
    </>
  );
};
