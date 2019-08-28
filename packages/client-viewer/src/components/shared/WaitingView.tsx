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
          return (
            <Typography component='p'>デバイス: {value.displayName}</Typography>
          );
        }}
      </ViewerInfoConsumer>
    </Box>
  );
};
