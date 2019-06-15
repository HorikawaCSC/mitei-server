import { exec } from 'child_process';
import { ProbeResult } from '../../types/ffprobe';

export const ffprobe = async (filePath: string) => {
  return new Promise<ProbeResult>((resolve, reject) =>
    exec(
      ['ffprobe', '-of', 'json', '-show_streams', filePath].join(' '),
      { encoding: 'utf8' },
      (err, stdout) => {
        if (err) reject(err);
        else {
          try {
            resolve(JSON.parse(stdout));
          } catch (e) {
            reject(e);
          }
        }
      },
    ),
  );
};
