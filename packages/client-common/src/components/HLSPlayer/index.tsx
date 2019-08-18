import * as Hls from 'hls.js';
import * as React from 'react';

type Props = {
  source: string;
  autoFix?: boolean;
  controls?: boolean;
  autoplay?: boolean;
  className?: string;
};

export const HLSPlayer = (props: Props) => {
  const hls = React.useMemo(
    () =>
      new Hls({
        debug: process.env.NODE_ENV !== 'production',
      }),
    [],
  );
  const supported = React.useMemo(() => Hls.isSupported(), []);
  const videoRef = React.createRef<HTMLVideoElement>();

  const tryPlay = React.useCallback(async () => {
    try {
      if (videoRef.current) await videoRef.current.play();
    } catch (err) {
      console.error('failed to play automatically', err);
    }
  }, [videoRef.current]);

  const restartHls = React.useCallback(() => {
    hls.detachMedia();
    hls.destroy();
  }, [hls]);

  const setupErrorHandle = React.useCallback(() => {
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.log('fatal network error encountered, try to recover');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('fatal media error encountered, try to recover');
            hls.recoverMediaError();
            break;
          default:
            // cannot recover
            restartHls();
            break;
        }
      }
    });
  }, [hls]);

  React.useEffect(() => {
    if (!videoRef.current) return;
    if (supported && !hls.media) {
      console.log('hls attached and will be initialized');
      hls.attachMedia(videoRef.current);
      hls.loadSource(props.source);

      if (props.autoplay) {
        hls.once(Hls.Events.MANIFEST_PARSED, () => tryPlay());
      }
      setupErrorHandle();
    } else if (
      !supported &&
      videoRef.current.canPlayType('application/vnd.apple.mpegurl')
    ) {
      console.log('use native hls playback mode');
      videoRef.current.src = props.source;
      tryPlay();
    }

    return () => hls.destroy();
  }, [videoRef.current]);

  return supported ? (
    <video
      ref={videoRef}
      controls={props.controls}
      autoPlay={props.autoplay}
      className={props.className}
    />
  ) : (
    <p>playback not supported</p>
  );
};
