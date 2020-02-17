import { Router } from 'express';
import { config } from '../config';
import { system } from '../utils/logging';

export const router = Router();

const registerFrontendScripts = (name: string) => {
  const manifest = require(`${name}/dist/manifest.json`) as Record<
    string,
    string
  >;
  for (const [moduleName, path] of Object.entries(manifest)) {
    if (!!moduleName.match(/\.html/)) continue;
    if (!!moduleName.match(/\.map/) && config.prod) continue;
    const absolutePath = require.resolve(`${name}${path}`);
    router.get(path, (_req, res) => res.sendFile(absolutePath));
    system.debug(
      `registered module ${moduleName} on ${absolutePath} from ${name}`,
    );
  }
};

registerFrontendScripts('@mitei/client-admin');
registerFrontendScripts('@mitei/client-viewer');

const adminIndex = require.resolve('@mitei/client-admin/dist/index.html');
router.get('/admin/*', (_req, res) => res.sendFile(adminIndex));

const viewerIndex = require.resolve('@mitei/client-viewer/dist/index.html');
router.get('/viewer', (_req, res) => res.sendFile(viewerIndex));
