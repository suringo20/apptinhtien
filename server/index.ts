import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import tripRouter from './routes/trip.js';

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trip', tripRouter);
  return app;
}

const PORT = process.env.PORT ?? 3000;
const app = buildApp();
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
