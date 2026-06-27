import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const db = getDb();
  const trip = db.prepare('SELECT id FROM trips ORDER BY id DESC LIMIT 1').get() as
    | { id: number }
    | undefined;
  if (!trip) { res.status(404).json({ error: 'No trip' }); return; }

  const activities = db
    .prepare('SELECT * FROM activities WHERE trip_id = ?')
    .all(trip.id) as { id: number; name: string; total_amount: number }[];

  const result = activities.map((a) => {
    const participants = db
      .prepare(
        `SELECT m.id, m.name FROM members m
         JOIN activity_members am ON am.member_id = m.id
         WHERE am.activity_id = ?`
      )
      .all(a.id) as { id: number; name: string }[];
    return { ...a, participants };
  });

  res.json(result);
});

router.post('/', requireOrganizer, (req, res) => {
  const { name, totalAmount, memberIds } = req.body as {
    name: string;
    totalAmount: number;
    memberIds: number[];
  };
  if (!name || !totalAmount || !memberIds?.length) {
    res.status(400).json({ error: 'name, totalAmount, memberIds required' });
    return;
  }

  const db = getDb();
  const trip = db.prepare('SELECT id FROM trips ORDER BY id DESC LIMIT 1').get() as
    | { id: number }
    | undefined;
  if (!trip) { res.status(404).json({ error: 'No trip' }); return; }

  const act = db
    .prepare('INSERT INTO activities (trip_id, name, total_amount) VALUES (?, ?, ?)')
    .run(trip.id, name, totalAmount);
  const actId = act.lastInsertRowid as number;

  const ins = db.prepare('INSERT INTO activity_members (activity_id, member_id) VALUES (?, ?)');
  for (const mid of memberIds) ins.run(actId, mid);

  res.status(201).json({ id: actId });
});

router.put('/:id', requireOrganizer, (req, res) => {
  const id = Number(req.params['id']);
  const { name, totalAmount, memberIds } = req.body as {
    name: string;
    totalAmount: number;
    memberIds: number[];
  };
  const db = getDb();
  db.prepare('UPDATE activities SET name = ?, total_amount = ? WHERE id = ?').run(
    name,
    totalAmount,
    id
  );
  db.prepare('DELETE FROM activity_members WHERE activity_id = ?').run(id);
  const ins = db.prepare('INSERT INTO activity_members (activity_id, member_id) VALUES (?, ?)');
  for (const mid of memberIds) ins.run(id, mid);
  res.json({ id });
});

router.delete('/:id', requireOrganizer, (req, res) => {
  const id = Number(req.params['id']);
  const db = getDb();
  db.prepare('DELETE FROM activities WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
