import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useGetRecordSourceQuery } from '../../../api/generated/graphql';
import { SourceDetails } from '../../../components/sources/SourceDetails';

export const RecordSourceDetails = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const sourceId = match.params.id;
  const { data, loading } = useGetRecordSourceQuery({
    variables: { id: sourceId },
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.source) {
    return <p>error</p>;
  }

  const { source } = data;

  return (
    <>
      <SourceDetails source={source} />
    </>
  );
};
