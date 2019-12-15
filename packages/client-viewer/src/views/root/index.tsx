import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { FullscreenProgress } from '@mitei/client-common';
import * as React from 'react';
import { useGetViewerInfoQuery } from '../../api/generated/graphql';
import { ViewerInfoProvider } from '../../components/shared/ViewerInfoContext';
import { MericsProvider } from '../../features/metrics/MetricsContext';
import { RegistrationView } from '../registration';
import { ViewerRoot } from '../viewer';

const useStyles = makeStyles({
  viewer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'none',
  },
});
export const Root = () => {
  const styles = useStyles();
  const { error, data, loading, refetch } = useGetViewerInfoQuery();
  if (loading) return <FullscreenProgress />;
  if (error) return <p>an error occured while getting device information</p>;

  if (data && data.viewerInfo) {
    return (
      <ViewerInfoProvider value={data.viewerInfo}>
        <MericsProvider>
          <Box className={styles.viewer}>
            <ViewerRoot />
          </Box>
        </MericsProvider>
      </ViewerInfoProvider>
    );
  } else {
    return <RegistrationView refetch={refetch} />;
  }
};
