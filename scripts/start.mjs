import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const standalone = resolve('.next/standalone');
if (!existsSync(resolve(standalone, 'server.js')))
  throw new Error('Build the website first with npm run build.');
cpSync(resolve('public'), resolve(standalone, 'public'), { recursive: true });
mkdirSync(resolve(standalone, '.next'), { recursive: true });
cpSync(resolve('.next/static'), resolve(standalone, '.next/static'), { recursive: true });
const child = spawn(process.execPath, ['--use-system-ca', resolve(standalone, 'server.js')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || '3000',
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
  },
  windowsHide: true,
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => {
  process.exitCode = code || 0;
});
