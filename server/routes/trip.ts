import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { name, currency, orgCode, members, start_date, end_date } = req.body as {
    name: string;
    currency: string;
    orgCode: string;
    members: { name: string; contact: string }[];
    start_date?: string;
    end_date?: string;
  };

  if (!name || !orgCode || !members?.length) {
    res.status(400).json({ error: 'name, orgCode, and members required' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM trips LIMIT 1').get();
  if (existing) {
    res.status(409).json({ error: 'A trip already exists' });
    return;
  }

  const hash = bcrypt.hashSync(orgCode, 10);
  const result = db
    .prepare(
      'INSERT INTO trips (name, start_date, end_date, currency, organizer_code) VALUES (?, ?, ?, ?, ?)'
    )
    .run(name, start_date ?? null, end_date ?? null, currency ?? '₫', hash);

  const tripId = result.lastInsertRowid as number;

  const insertMember = db.prepare(
    'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?, ?, ?, ?)'
  );
  for (const m of members) {
    insertMember.run(tripId, m.name, m.contact, 0);
  }

  // Mark first member as organizer (safe for all SQLite builds)
  const firstMember = db.prepare('SELECT id FROM members WHERE trip_id = ? ORDER BY id LIMIT 1').get(tripId) as { id: number };
  db.prepare('UPDATE members SET is_organizer = 1 WHERE id = ?').run(firstMember.id);

  res.status(201).json({ id: tripId });
});

router.get('/', (req, res) => {
  const db = getDb();
  const trip = db.prepare('SELECT * FROM trips ORDER BY id DESC LIMIT 1').get() as
    | Record<string, unknown>
    | undefined;
  if (!trip) {
    res.status(404).json({ error: 'No active trip' });
    return;
  }
  const members = db
    .prepare('SELECT id, name, contact, is_organizer FROM members WHERE trip_id = ?')
    .all(trip['id']);
  res.json({ ...trip, members });
});

export default router;
