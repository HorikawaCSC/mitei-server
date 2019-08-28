export const channelManifestUrl = (channelId: string, token = '') =>
  `/api/channel/${channelId}/manifest.m3u8?t=${token}`;
