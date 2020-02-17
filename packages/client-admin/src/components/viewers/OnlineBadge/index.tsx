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
import Typography from '@material-ui/core/Typography';
import { CheckBoxOutlined, DesktopAccessDisabled } from '@material-ui/icons';
import clsx from 'clsx';
import * as React from 'react';

const useStyles = makeStyles({
  common: {
    display: 'flex',
  },
  online: {
    color: 'rgba(0, 255, 0, .8)',
  },
  offline: {
    color: 'rgba(255, 0, 0, .8)',
  },
});
export const OnlineBadge = ({ online }: { online: boolean }) => {
  const styles = useStyles();
  if (online) {
    return (
      <Box className={clsx(styles.common, styles.online)}>
        <CheckBoxOutlined />
        <Typography>オンライン</Typography>
      </Box>
    );
  } else {
    return (
      <Box className={clsx(styles.common, styles.offline)}>
        <DesktopAccessDisabled />
        <Typography>オフライン</Typography>
      </Box>
    );
  }
};
