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
import { DateTime } from 'luxon';
import * as React from 'react';
import { ViewerInfoConsumer } from './ViewerInfoContext';

const useStyles = makeStyles({
  imageBg: {
    display: 'flex',
    position: 'absolute',
    backgroundImage: `url(${require('../../resources/poster.png')})`,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, .95)',
    flexDirection: 'column',
  },
  clock: {
    fontSize: '15vw',
  },
});

export const WaitingView = () => {
  const styles = useStyles();
  const [time, setTime] = React.useState();

  React.useEffect(() => {
    setTime(DateTime.local().toFormat('HH:mm'));
    const timer = setInterval(() => {
      const dt = DateTime.local();
      setTime(dt.toFormat(dt.millisecond > 500 ? 'HH:mm' : 'HH mm'));
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box className={styles.imageBg}>
      <Typography variant='h1' className={styles.clock}>
        {time}
      </Typography>
      <ViewerInfoConsumer>
        {value => {
          return value ? (
            <Typography component='p'>デバイス: {value.displayName}</Typography>
          ) : (
            <Typography component='b'>初期化中</Typography>
          );
        }}
      </ViewerInfoConsumer>
    </Box>
  );
};
