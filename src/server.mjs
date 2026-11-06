import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

function respond(response, status, body = '', headers = {}) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  response.end(body);
}

export function createPreviewServer(root) {
  const documentRoot = path.resolve(root);
  return createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      respond(response, 405, '', { Allow: 'GET, HEAD' });
      return;
    }

    let url;
    let target;
    try {
      url = new URL(request.url, 'http://127.0.0.1');
      target = path.resolve(documentRoot, '.' + decodeURIComponent(url.pathname));
    } catch {
      respond(response, 400, 'Bad request');
      return;
    }

    if (target !== documentRoot && !target.startsWith(documentRoot + path.sep)) {
      respond(response, 403);
      return;
    }

    try {
      let info = await stat(target);
      if (info.isDirectory()) {
        if (!url.pathname.endsWith('/')) {
          respond(response, 302, '', { Location: url.pathname + '/' + url.search });
          return;
        }
        target = path.join(target, 'index.html');
        info = await stat(target);
      }

      const contentType = CONTENT_TYPES[path.extname(target).toLowerCase()];
      if (!info.isFile() || !contentType) {
        respond(response, 404, '페이지를 찾을 수 없습니다.');
        return;
      }

      response.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      if (request.method === 'HEAD') response.end();
      else await pipeline(createReadStream(target), response);
    } catch (error) {
      if (response.headersSent) {
        response.destroy();
      } else if (['ENOENT', 'ENOTDIR'].includes(error.code)) {
        respond(response, 404, '페이지를 찾을 수 없습니다.');
      } else {
        respond(response, 500, 'Internal server error');
      }
    }
  });
}
