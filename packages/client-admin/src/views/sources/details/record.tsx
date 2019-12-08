import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView, routes } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  TranscodeStatus,
  useGetRecordSourceQuery,
} from '../../../api/generated/graphql';
import { PreviewSection } from '../../../components/shared/PreviewSection';
import { SourceDetails } from '../../../components/sources/SourceDetails';

export const RecordSourceDetails = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const sourceId = match.params.id;
  const { data, loading, error } = useGetRecordSourceQuery({
    variables: { id: sourceId },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (
    !data ||
    !data.source ||
    data.source.__typename !== 'RecordSource' ||
    error
  ) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { source } = data;

  return (
    <>
      <SourceDetails source={source} />
      {(source.status === TranscodeStatus.Success ||
        source.status === TranscodeStatus.Running) && (
        <PreviewSection source={routes.media.source(source.id)} />
      )}
    </>
  );
};
