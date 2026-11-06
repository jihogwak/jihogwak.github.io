import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request } from 'node:http';
import { test } from 'node:test';
import { PROJECT_ROOT } from '../build.mjs';
import { createPreviewServer } from '../src/server.mjs';

function sendRequest(port, requestPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const outgoing = request(
      { hostname: '127.0.0.1', port, path: requestPath, method },
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () =>
          resolve({ status: response.statusCode, headers: response.headers, body }),
        );
      },
    );
    outgoing.on('error', reject);
    outgoing.end();
  });
}

test('preview serves pages and browser modules with correct HTTP behavior', async (context) => {
  const server = createPreviewServer(PROJECT_ROOT);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();

  const home = await sendRequest(port, '/');
  assert.equal(home.status, 200);
  assert.match(home.headers['content-type'], /text\/html/);
  assert.equal(home.headers['cache-control'], 'no-store');
  assert.match(home.body, /곽지호/);

  for (const filename of ['landscape', 'architecture']) {
    const result = await sendRequest(port, `/embedding-model-landscape/${filename}.js`);
    assert.equal(result.status, 200);
    assert.match(result.headers['content-type'], /text\/javascript/);
  }

  const redirect = await sendRequest(port, '/projects/embedding?view=full');
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.location, '/projects/embedding/?view=full');
  const head = await sendRequest(port, '/', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.equal((await sendRequest(port, '/missing.html')).status, 404);
  assert.equal((await sendRequest(port, '/content.json')).status, 404);
  assert.equal((await sendRequest(port, '/%')).status, 400);
  assert.equal((await sendRequest(port, '/..%2foutside.html')).status, 403);
  assert.equal((await sendRequest(port, '/', 'POST')).status, 405);
});
