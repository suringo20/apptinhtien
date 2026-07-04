import express from 'express';
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

  if (process.env.NODE_ENV === 'production') {
    const staticDir = path.join(__dirname, '../client/dist');
    app.use(express.static(staticDir));
    app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT ?? 3000;
  buildApp().listen(PORT, () => console.log(`Server running on :${PORT}`));
}
