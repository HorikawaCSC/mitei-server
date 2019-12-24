import * as Hls from 'hls.js';
import * as React from 'react';

type Props = {
  className?: string;
  source: string;
  autoFix?: boolean;
  controls?: boolean;
  autoplay?: boolean;
  onNotFound?: () => void;
  onPlay?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: () => void;
  onHlsError?: (err: Hls.errorData) => void;
  onStallBuffer?: () => void;
};

const createHls = () =>
  new Hls({
    debug: process.env.NODE_ENV !== 'production',
    levelLoadingMaxRetry: 1,
    fragLoadingMaxRetry: 3,
    manifestLoadingMaxRetry: 1,
  });

export const HLSPlayer = (props: Props) => {
  const [hls, setHls] = React.useState(() => createHls());
  const videoRef = React.createRef<HTMLVideoElement>();
  const hlsJsSupported = React.useMemo(() => Hls.isSupported(), []);
  const nativeSupported = React.useMemo(
    () =>
      videoRef.current
        ? videoRef.current.canPlayType('application/vnd.apple.mpegurl')
        : true,
    [videoRef.current],
  );

  const tryPlay = React.useCallback(async () => {
    try {
      if (videoRef.current) await videoRef.current.play();
    } catch (err) {
      console.error('failed to play automatically', err);
    }
  }, [videoRef.current]);

  const restartHls = () => {
    hls.destroy();

    console.error('hls.js restarting');
    setHls(createHls());
  };

  // error handler
  const setupErrorHandle = () => {
    hls.on(Hls.Events.ERROR, (_e, data) => {
      console.log(data);
      if (props.onHlsError) props.onHlsError(data);
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          // try to recover network error
          console.log(data);
          if (data.response && data.response.code === 404) {
            if (props.onNotFound) props.onNotFound();
          }

          hls.startLoad();
          break;
        default:
          // cannot recover
          if (data.fatal) restartHls();
          // stall
          if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
            restartHls();
          }
          break;
      }
    });
  };

  React.useEffect(() => {
    if (!videoRef.current) return;
    if (hlsJsSupported && !hls.media) {
      console.log('hls attached and will be initialized');
      hls.attachMedia(videoRef.current);
      hls.loadSource(props.source);

      if (props.autoplay) {
        hls.once(Hls.Events.MANIFEST_PARSED, () => tryPlay());
      }
      setupErrorHandle();
    } else if (!hlsJsSupported && nativeSupported) {
      console.log('use native hls playback mode');
      videoRef.current.src = props.source;
      tryPlay();
      return;
    }

    return () => hls.destroy();
  }, [videoRef.current, hls]);

  return hlsJsSupported || nativeSupported ? (
    <video
      className={props.className}
      ref={videoRef}
      controls={props.controls}
      autoPlay={props.autoplay}
      onPlay={props.onPlay}
      onEnded={props.onEnded}
      onTimeUpdate={props.onTimeUpdate}
    />
  ) : (
    <p>playback not supported</p>
  );
};
