import { makeStyles } from '@material-ui/core/styles';
import { HLSPlayer } from '@mitei/client-common';
import * as React from 'react';
import { useChannelPlay } from '../../utils/channel';
import { isDebug } from '../../utils/config';
import { channelManifestUrl } from '../../utils/route';
import { WaitingView } from '../shared/WaitingView';

const useStyles = makeStyles({
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
type Props = {
  channelId: string;
};
export const ChannelPlayer = ({ channelId }: Props) => {
  const [scheduleAvailable] = useChannelPlay(channelId);
  const [playing, setPlaying] = React.useState(false);
  const styles = useStyles();

  const handlePlay = () => {
    setPlaying(true);
  };
  const handlePlayEnd = () => {
    setPlaying(false);
  };
  const handleNotFound = () => {
    console.log('not found');
    setPlaying(false);
  };
  const playable = React.useMemo(() => (playing ? true : scheduleAvailable), [
    scheduleAvailable,
    playing,
  ]);
  return playable ? (
    <HLSPlayer
      onPlay={handlePlay}
      onEnded={handlePlayEnd}
      controls={isDebug}
      source={channelManifestUrl(channelId)}
      onNotFound={handleNotFound}
      autoplay
      className={styles.video}
    />
  ) : (
    <WaitingView />
  );
};
