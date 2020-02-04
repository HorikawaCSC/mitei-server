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

import { makeStyles } from '@material-ui/core/styles';
import { HLSPlayer, useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { useGetSourceSimpleQuery } from '../../api/generated/graphql';
import { metricsReporter } from '../../features/metrics';
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
  volume: number;
};
export const SourcePlayer = ({ sourceId, volume }: Props) => {
  const { data, error, loading } = useGetSourceSimpleQuery({
    variables: {
      sourceId,
    },
  });
  const [playing, setPlaying] = React.useState(true);
  const [showControls, setShowControls] = React.useState(isDebug);
  const styles = useStyles();
  const showSnack = useErrorSnack();
  const [previousReportTime, setPreviousReportTime] = React.useState(() =>
    Date.now(),
  );

  const handlePlayEnd = React.useCallback(() => {
    metricsReporter.ended();
    setPlaying(false);
  }, []);

  const handleAutoplayFail = React.useCallback(() => {
    showSnack('自動再生に失敗しました。手動で再生を開始してください。');
    setShowControls(true);
  }, []);

  React.useEffect(() => {
    setPlaying(true);
  }, [sourceId]);

  const handleTimeUpdate = React.useCallback(
    time => {
      if (Date.now() - previousReportTime > 1000 * 5) {
        metricsReporter.elapsed(time);
        setPreviousReportTime(Date.now());
      }
    },
    [previousReportTime],
  );

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
      volume={volume}
      onTimeUpdate={handleTimeUpdate}
    />
  );
};
