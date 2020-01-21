import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useGetViewerDeviceQuery } from '../../../api/generated/graphql';
import { SummarySection } from '../../../components/viewers/SummarySection';

type Props = RouteComponentProps<{ id: string }>;
export const ViewerDetails = (props: Props) => {
  const { data, loading, error } = useGetViewerDeviceQuery({
    variables: {
      id: props.match.params.id,
    },
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.viewerDevice || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  return (
    <>
      <SummarySection device={data.viewerDevice} />
    </>
  );
};
