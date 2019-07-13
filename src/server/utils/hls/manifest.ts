export interface ManifestItem {
  url: string;
  duration: number;
  discontinuityBegin?: true;
}

export interface ManifestInput {
  seqBegin: number;
  items: ManifestItem[];
  endList?: true;
}

export const generateManifest = (input: ManifestInput) => {
  const maxDuration = input.items
    .slice()
    .sort((a, b) => b.duration - a.duration)[0].duration;
  const content = [
    '#EXTM3U',
    `#EXT-X-TARGETDURATION:${Math.ceil(maxDuration) + 1}`,
    '#EXT-X-VERSION:4',
    `#EXT-X-MEDIA-SEQUENCE:${input.seqBegin}`,
  ];
  for (const item of input.items) {
    if (item.discontinuityBegin) content.push('#EXT-X-DISCONTINUITY');

    content.push(`#EXTINF:${item.duration},`, item.url);
  }
  if (input.endList) {
    content.push('#EXT-X-ENDLIST');
  }

  return content.join('\n');
};
