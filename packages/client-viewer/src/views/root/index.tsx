/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import {
  FullscreenProgress,
  MessageSnackContextProvider,
  MessageSnackView,
} from '@mitei/client-common';
import * as React from 'react';
import { useGetViewerInfoQuery } from '../../api/generated/graphql';
import { ViewerInfoProvider } from '../../components/shared/ViewerInfoContext';
import { PingMetricsReporter } from '../../features/metrics/PingReporter';
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
        <PingMetricsReporter />
        <MessageSnackContextProvider>
          <Box className={styles.viewer}>
            <ViewerRoot />
            <MessageSnackView />
          </Box>
        </MessageSnackContextProvider>
      </ViewerInfoProvider>
    );
  } else {
    return <RegistrationView refetch={refetch} />;
  }
};
