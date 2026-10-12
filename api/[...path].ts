import express from 'express';
import type { Request, Response } from 'express';
import { apiRouter } from '../src/server/api.ts';

const app = express();
app.use(express.json({ limit: '32kb' }));
app.use('/api', apiRouter);

export default function handler(request: Request, response: Response) {
  return app(request, response);
}
