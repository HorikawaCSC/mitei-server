import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useGetFileSourceQuery } from '../../../api/generated/graphql';

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
    <PageContainer title={`ソース: ${source.name}`}>
      <Typography>ソースのステータス: {source.status}</Typography>
    </PageContainer>
  );
};
