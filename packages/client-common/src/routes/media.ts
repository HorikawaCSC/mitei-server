export const mediaRoutes = {
  channel: (name: string) => `/api/channel/${name}/manifest.m3u8`,
  source: (name: string) => `/api/source/${name}/manifest.m3u8`,
};
