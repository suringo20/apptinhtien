import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

const router = Router();

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

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
  const hash = bcrypt.hashSync(orgCode, 10);

  let code = generateCode();
  // Ensure uniqueness
  while (db.prepare('SELECT id FROM trips WHERE code = ?').get(code)) {
    code = generateCode();
  }

  const result = db
    .prepare(
      'INSERT INTO trips (code, name, start_date, end_date, currency, organizer_code) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(code, name, start_date ?? null, end_date ?? null, currency ?? '₫', hash);

  const tripId = result.lastInsertRowid as number;

  const insertMember = db.prepare(
    'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?, ?, ?, ?)'
  );
  for (const m of members) {
    insertMember.run(tripId, m.name, m.contact, 0);
  }

  // Mark first member as organizer
  const firstMember = db.prepare('SELECT id FROM members WHERE trip_id = ? ORDER BY id LIMIT 1').get(tripId) as { id: number };
  db.prepare('UPDATE members SET is_organizer = 1 WHERE id = ?').run(firstMember.id);

  res.status(201).json({ id: tripId, code });
});

router.get('/', (req, res) => {
  const db = getDb();
  const { code } = req.query as { code?: string };

  let trip: Record<string, unknown> | undefined;
  if (code) {
    trip = db.prepare('SELECT * FROM trips WHERE code = ?').get(code) as Record<string, unknown> | undefined;
  } else {
    // Fall back to trip scoped by member's trip_id (via auth header)
    const memberId = req.headers['x-member-id'];
    if (memberId) {
      const member = db.prepare('SELECT trip_id FROM members WHERE id = ?').get(Number(memberId)) as { trip_id: number } | undefined;
      if (member) {
        trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(member.trip_id) as Record<string, unknown> | undefined;
      }
    }
  }

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
