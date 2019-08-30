interface RtmpEventBase<T = string> {
  call: T;
  addr: string;
  app: string;
  flashver: string;
  swfurl: string;
  tcurl: string;
  pageurl: string;
}

export interface RtmpPublishEvent extends RtmpEventBase<'publish'> {
  clientid: string;
  name: string;
  [key: string]: string;
}

export interface RtmpPlayEvent extends RtmpEventBase<'play'> {
  clientid: string;
  name: string;
  [key: string]: string;
}
export interface RtmpPublishDoneEvent extends RtmpEventBase<'publish_done'> {
  clientid: string;
  name: string;
  [key: string]: string;
}

export type RtmpEvent = RtmpPublishEvent | RtmpPublishDoneEvent | RtmpPlayEvent;
