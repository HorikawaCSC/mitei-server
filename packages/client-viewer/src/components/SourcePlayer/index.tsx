import { makeStyles } from '@material-ui/core/styles';
import { HLSPlayer, useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { useGetSourceSimpleQuery } from '../../api/generated/graphql';
import { isDebug } from '../../utils/config';
import { sourceManifestUrl } from '../../utils/route';
import { WaitingView } from '../shared/WaitingView';

const useStyles = makeStyles({
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
type Props = {
  sourceId: string;
};
export const SourcePlayer = ({ sourceId }: Props) => {
  const { data, error, loading } = useGetSourceSimpleQuery({
    variables: {
      sourceId,
    },
  });
  const [playing, setPlaying] = React.useState(true);
  const [showControls, setShowControls] = React.useState(isDebug);
  const styles = useStyles();
  const showSnack = useErrorSnack();

  const handlePlayEnd = React.useCallback(() => {
    setPlaying(false);
  }, []);

  const handleAutoplayFail = React.useCallback(() => {
    showSnack('自動再生に失敗しました。手動で再生を開始してください。');
    setShowControls(true);
  }, []);

  React.useEffect(() => {
    setPlaying(true);
  }, [sourceId]);

  if (error) {
    return <p>an error occured: {error.message}</p>;
  }

  if (loading || !data || !playing) {
    return <WaitingView />;
  }

  return (
    <HLSPlayer
      onEnded={handlePlayEnd}
      controls={showControls}
      source={sourceManifestUrl(sourceId)}
      autoplay
      className={styles.video}
      autoFix
      onAutoPlayFailure={handleAutoplayFail}
    />
  );
};
