import http from 'node:http';
import { open } from 'node:fs/promises';
import path from 'node:path';

const indexHtmlPath = path.join(import.meta.dirname, '..', 'front', 'index.html');

http
  .createServer(async (request, response) => {
    request.on('error', err => {
      console.error(err);
      response.statusCode = 400;
      response.end();
    });
    response.on('error', err => {
      console.error(err);
    });

    if (request.method === 'GET') {
      const fd = await open(indexHtmlPath);
      const fileStream = fd.createReadStream();
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html');
      fileStream.pipe(response);
    } else {
      response.statusCode = 404;
      response.end();
    }
  })
  .listen(8081);