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

import { makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import * as React from 'react';

export const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 0),
  },
}));

type Props = {
  title: string;
  mini?: boolean;
};

export const PageContainer: React.SFC<Props> = ({ title, children, mini }) => {
  const styles = useStyles();
  return (
    <Paper className={styles.paper}>
      <Typography component={mini ? 'h6' : 'h5'} variant={mini ? 'h6' : 'h5'}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};
