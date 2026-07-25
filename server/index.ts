import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import tripRouter from './routes/trip.js';
import activitiesRouter from './routes/activities.js';
import summaryRouter from './routes/summary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trip', tripRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/api/summary', summaryRouter);

  // When this server also serves the built client (e.g. Render/VPS, not Vercel).
  if (process.env.SERVE_CLIENT === 'true') {
    const staticDir = path.join(__dirname, '../../client/dist');
    app.use(express.static(staticDir));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }

  // Central error handler so a rejected DB query returns 500, not a crash.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

// Only listen when run directly (local dev / Render). On Vercel the app is
// imported by the serverless function instead.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT ?? 3000;
  buildApp().listen(PORT, () => console.log(`Server running on :${PORT}`));
}
