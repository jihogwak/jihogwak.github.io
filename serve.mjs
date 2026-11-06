import fs from 'node:fs';
import path from 'node:path';
import { build, PROJECT_ROOT } from './build.mjs';
import { createPreviewServer } from './src/server.mjs';

const port = Number(process.env.PORT ?? 5174);
const contentFile = path.join(PROJECT_ROOT, 'content.json');

build();
const server = createPreviewServer(PROJECT_ROOT);
fs.watchFile(contentFile, { interval: 500 }, () => {
  try {
    build();
    console.log('Content rebuilt.');
  } catch (error) {
    console.error('Content error:', error.message);
  }
});

server.on('error', (error) => {
  fs.unwatchFile(contentFile);
  console.error('Preview error:', error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Portfolio: http://127.0.0.1:${port}/`));

function stop() {
  fs.unwatchFile(contentFile);
  server.close();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
