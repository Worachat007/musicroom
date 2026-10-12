import express from 'express';
import type { Request, Response } from 'express';
import { apiRouter } from '../src/server/api.ts';

const app = express();
app.use(express.json({ limit: '32kb' }));
app.use(apiRouter);

export default function handler(request: Request, response: Response) {
  const requestUrl = request.url ?? '/';
  if (requestUrl === '/api') request.url = '/';
  else if (requestUrl.startsWith('/api/')) request.url = requestUrl.slice(4);
  return app(request, response);
}
