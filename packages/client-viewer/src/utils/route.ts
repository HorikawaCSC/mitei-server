export const channelManifestUrl = (channelId: string, token = '') =>
  `/api/channel/${channelId}/manifest.m3u8?t=${token}`;

export const sourceManifestUrl = (sourceId: string, token = '') =>
  `/api/source/${sourceId}/manifest.m3u8?t=${token}`;
