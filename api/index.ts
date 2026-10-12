import express from 'express';
import type { Request, Response } from 'express';
import { apiRouter } from '../src/server/api.ts';

const app = express();
app.use(express.json({ limit: '32kb' }));
app.use(apiRouter);

export default function handler(request: Request, response: Response) {
  const requestUrl = new URL(request.url ?? '/', 'http://localhost');
  const routePath = requestUrl.searchParams.get('path');

  if (routePath) {
    requestUrl.searchParams.delete('path');
    request.url = `/${routePath.replace(/^\/+/, '')}${requestUrl.search}`;
  } else if (requestUrl.pathname === '/api') {
    request.url = `/${requestUrl.search}`;
  } else if (requestUrl.pathname.startsWith('/api/')) {
    request.url = `${requestUrl.pathname.slice(4)}${requestUrl.search}`;
  }

  return app(request, response);
}