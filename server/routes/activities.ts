import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';
import type Database from 'better-sqlite3';

const router = Router();
router.use(requireAuth);

// Resolve the trip that the authenticated member belongs to.
function memberTripId(db: Database.Database, memberId: number): number | undefined {
  const row = db.prepare('SELECT trip_id FROM members WHERE id = ?').get(memberId) as
    | { trip_id: number }
    | undefined;
  return row?.trip_id;
}

router.get('/', (req, res) => {
  const db = getDb();
  const memberId = res.locals['memberId'] as number;
  const tripId = memberTripId(db, memberId);
  if (!tripId) { res.status(404).json({ error: 'No trip' }); return; }

  const activities = db
    .prepare('SELECT * FROM activities WHERE trip_id = ?')
    .all(tripId) as { id: number; name: string; total_amount: number }[];

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
  if (!name || !totalAmount || totalAmount <= 0 || !memberIds?.length) {
    res.status(400).json({ error: 'name, positive totalAmount, and memberIds required' });
    return;
  }

  const db = getDb();
  const memberId = res.locals['memberId'] as number;
  const tripId = memberTripId(db, memberId);
  if (!tripId) { res.status(404).json({ error: 'No trip' }); return; }

  // Only members of this trip may be participants.
  const validIds = new Set(
    (db.prepare('SELECT id FROM members WHERE trip_id = ?').all(tripId) as { id: number }[]).map(m => m.id)
  );
  if (memberIds.some(id => !validIds.has(id))) {
    res.status(400).json({ error: 'All participants must belong to this trip' });
    return;
  }

  const act = db
    .prepare('INSERT INTO activities (trip_id, name, total_amount) VALUES (?, ?, ?)')
    .run(tripId, name, totalAmount);
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
  if (!name || !totalAmount || totalAmount <= 0 || !memberIds?.length) {
    res.status(400).json({ error: 'name, positive totalAmount, and memberIds required' });
    return;
  }

  const db = getDb();
  const memberId = res.locals['memberId'] as number;
  const tripId = memberTripId(db, memberId);

  // The activity must belong to the organizer's own trip.
  const act = db.prepare('SELECT trip_id FROM activities WHERE id = ?').get(id) as
    | { trip_id: number }
    | undefined;
  if (!act || act.trip_id !== tripId) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }

  const validIds = new Set(
    (db.prepare('SELECT id FROM members WHERE trip_id = ?').all(tripId) as { id: number }[]).map(m => m.id)
  );
  if (memberIds.some(mid => !validIds.has(mid))) {
    res.status(400).json({ error: 'All participants must belong to this trip' });
    return;
  }

  db.prepare('UPDATE activities SET name = ?, total_amount = ? WHERE id = ?').run(name, totalAmount, id);
  db.prepare('DELETE FROM activity_members WHERE activity_id = ?').run(id);
  const ins = db.prepare('INSERT INTO activity_members (activity_id, member_id) VALUES (?, ?)');
  for (const mid of memberIds) ins.run(id, mid);
  res.json({ id });
});

router.delete('/:id', requireOrganizer, (req, res) => {
  const id = Number(req.params['id']);
  const db = getDb();
  const memberId = res.locals['memberId'] as number;
  const tripId = memberTripId(db, memberId);

  const act = db.prepare('SELECT trip_id FROM activities WHERE id = ?').get(id) as
    | { trip_id: number }
    | undefined;
  if (!act || act.trip_id !== tripId) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }

  db.prepare('DELETE FROM activities WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
