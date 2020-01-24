import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  useGetViewerDeviceQuery,
  useViewerStateSingleSubscription,
} from '../../../api/generated/graphql';
import { DeviceDispatchSection } from '../../../components/viewers/DeviceDispatchSection';
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
  const { data: realtimeDev } = useViewerStateSingleSubscription({
    variables: {
      id: props.match.params.id,
    },
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
      <DeviceDispatchSection
        device={
          realtimeDev ? realtimeDev.viewerUpdateDevice : data.viewerDevice
        }
      />
    </>
  );
};
