import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useGetFileSourceQuery } from '../../../../api/generated/graphql';
import { PageContainer } from '../../../components/shared/PageContainer';

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
  return <PageContainer title={`ソース: ${source.name}`} />;
};
