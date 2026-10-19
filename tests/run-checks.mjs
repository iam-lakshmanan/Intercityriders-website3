import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve('.');
const standalone = resolve('.next/standalone');
if (!existsSync(resolve(standalone, 'server.js')))
  throw new Error('Run npm run build before integration or browser checks.');
cpSync(resolve('public'), resolve(standalone, 'public'), { recursive: true });
mkdirSync(resolve(standalone, '.next'), { recursive: true });
cpSync(resolve('.next/static'), resolve(standalone, '.next/static'), { recursive: true });
const browser = process.argv.includes('--browser');
const port = browser ? '3012' : '3011';
const base = `http://127.0.0.1:${port}`;
// These fake credentials and upstream interception belong only to this child process.
const env = {
  ...process.env,
  PORT: port,
  HOSTNAME: '127.0.0.1',
  NEXT_PUBLIC_SITE_URL: base,
  INTERCITY_TEST_URL: base,
  INTERCITY_TEST_UPSTREAMS: '1',
  TELEGRAM_BOT_TOKEN: 'isolated-test-token',
  TELEGRAM_CHAT_ID: 'isolated-test-chat',
  GOOGLE_MAPS_SERVER_API_KEY: 'isolated-test-maps',
  QUOTE_SIGNING_SECRET: 'isolated-test-secret-more-than-thirty-two-characters',
  TRUSTED_IP_HEADER: 'x-intercity-test-client',
  NEXT_TELEMETRY_DISABLED: '1',
};
const server = spawn(
  process.execPath,
  ['--require', resolve('tests/mock-upstreams.cjs'), resolve(standalone, 'server.js')],
  { cwd: root, env, stdio: 'inherit', windowsHide: true },
);
const completion = new Promise((resolve) => server.on('exit', resolve));
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(base);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Isolated test server did not start.');
  const args = browser
    ? [resolve('node_modules/@playwright/test/cli.js'), 'test']
    : [resolve('tests/integration.mjs')];
  const runner = spawn(process.execPath, args, {
    cwd: root,
    env,
    stdio: 'inherit',
    windowsHide: true,
  });
  const code = await new Promise((resolve) => runner.on('exit', resolve));
  if (code !== 0) process.exitCode = code || 1;
} finally {
  server.kill();
  await completion;
}
