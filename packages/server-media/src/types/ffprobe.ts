interface Stream {
  index: number;
  codec_name: string;
  duration: string;
  bit_rate: string;
}

export interface VideoStream extends Stream {
  codec_type: 'video';
  width: number;
  height: number;
  sample_aspect_ratio: string;
  display_aspect_ratio: string;
}

export interface AudioStream extends Stream {
  codec_type: 'audio';
  channels: number;
}

export interface ProbeResult {
  streams: Array<VideoStream | AudioStream>;
}
