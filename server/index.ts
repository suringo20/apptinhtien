import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import tripRouter from './routes/trip.js';
import activitiesRouter from './routes/activities.js';

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trip', tripRouter);
  app.use('/api/activities', activitiesRouter);
  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT ?? 3000;
  buildApp().listen(PORT, () => console.log(`Server running on :${PORT}`));
}
