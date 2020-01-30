import { makeStyles } from '@material-ui/core/styles';
import { HLSPlayer, useErrorSnack } from '@mitei/client-common';
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
  volume: number;
};
export const ChannelPlayer = ({ channelId, volume }: Props) => {
  const [scheduleAvailable, remain] = useChannelPlay(channelId);
  const [playing, setPlaying] = React.useState(false);
  const [showControls, setShowControls] = React.useState(isDebug);
  const styles = useStyles();
  const showSnack = useErrorSnack();

  const handlePlay = React.useCallback(() => {
    setPlaying(true);
    setShowControls(false);
    console.log('play', scheduleAvailable, remain);
  }, [scheduleAvailable, remain]);

  const handlePlayEnd = React.useCallback(() => {
    setPlaying(false);
    console.log('play end', scheduleAvailable, remain);
  }, [scheduleAvailable, remain]);

  const handleStall = React.useCallback(() => {
    console.log('stall', scheduleAvailable, remain);
    if (!scheduleAvailable) {
      setPlaying(false);
    }
  }, [scheduleAvailable, remain]);

  const handleAutoplayFail = React.useCallback(() => {
    showSnack('自動再生に失敗しました。手動で再生を開始してください。');
    setShowControls(true);
  }, []);

  const playable = React.useMemo(() => (playing ? true : scheduleAvailable), [
    scheduleAvailable,
    playing,
  ]);

  if (isDebug) console.log('playable', playable);

  return playable ? (
    <HLSPlayer
      onPlay={handlePlay}
      onEnded={handlePlayEnd}
      controls={showControls}
      source={channelManifestUrl(channelId)}
      autoplay
      className={styles.video}
      autoFix
      onStallBuffer={handleStall}
      onAutoPlayFailure={handleAutoplayFail}
      volume={volume}
    />
  ) : (
    <WaitingView />
  );
};
