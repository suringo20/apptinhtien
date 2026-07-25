import { Router } from 'express';
import { query, one } from '../db.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';
import { ah } from '../lib/asyncHandler.js';

const router = Router();
router.use(requireAuth);

// Resolve the trip that the authenticated member belongs to.
async function memberTripId(memberId: number): Promise<number | undefined> {
  const row = await one<{ trip_id: number }>('SELECT trip_id FROM members WHERE id = $1', [memberId]);
  return row?.trip_id;
}

// Set of member ids that belong to a trip.
async function tripMemberIds(tripId: number): Promise<Set<number>> {
  const rows = await query<{ id: number }>('SELECT id FROM members WHERE trip_id = $1', [tripId]);
  return new Set(rows.map(r => r.id));
}

router.get('/', ah(async (_req, res) => {
  const memberId = res.locals['memberId'] as number;
  const tripId = await memberTripId(memberId);
  if (!tripId) { res.status(404).json({ error: 'No trip' }); return; }

  const activities = await query<{ id: number; name: string; total_amount: number }>(
    'SELECT id, name, total_amount FROM activities WHERE trip_id = $1 ORDER BY id',
    [tripId]
  );

  const result = [];
  for (const a of activities) {
    const participants = await query<{ id: number; name: string }>(
      `SELECT m.id, m.name FROM members m
       JOIN activity_members am ON am.member_id = m.id
       WHERE am.activity_id = $1`,
      [a.id]
    );
    result.push({ ...a, participants });
  }

  res.json(result);
}));

router.post('/', requireOrganizer, ah(async (req, res) => {
  const { name, totalAmount, memberIds } = req.body as {
    name: string;
    totalAmount: number;
    memberIds: number[];
  };
  if (!name || !totalAmount || totalAmount <= 0 || !memberIds?.length) {
    res.status(400).json({ error: 'name, positive totalAmount, and memberIds required' });
    return;
  }

  const memberId = res.locals['memberId'] as number;
  const tripId = await memberTripId(memberId);
  if (!tripId) { res.status(404).json({ error: 'No trip' }); return; }

  const validIds = await tripMemberIds(tripId);
  if (memberIds.some(id => !validIds.has(id))) {
    res.status(400).json({ error: 'All participants must belong to this trip' });
    return;
  }

  const act = await one<{ id: number }>(
    'INSERT INTO activities (trip_id, name, total_amount) VALUES ($1, $2, $3) RETURNING id',
    [tripId, name, totalAmount]
  );
  const actId = act!.id;

  for (const mid of memberIds) {
    await query('INSERT INTO activity_members (activity_id, member_id) VALUES ($1, $2)', [actId, mid]);
  }

  res.status(201).json({ id: actId });
}));

router.put('/:id', requireOrganizer, ah(async (req, res) => {
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

  const memberId = res.locals['memberId'] as number;
  const tripId = await memberTripId(memberId);

  const act = await one<{ trip_id: number }>('SELECT trip_id FROM activities WHERE id = $1', [id]);
  if (!act || act.trip_id !== tripId) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }

  const validIds = await tripMemberIds(tripId!);
  if (memberIds.some(mid => !validIds.has(mid))) {
    res.status(400).json({ error: 'All participants must belong to this trip' });
    return;
  }

  await query('UPDATE activities SET name = $1, total_amount = $2 WHERE id = $3', [name, totalAmount, id]);
  await query('DELETE FROM activity_members WHERE activity_id = $1', [id]);
  for (const mid of memberIds) {
    await query('INSERT INTO activity_members (activity_id, member_id) VALUES ($1, $2)', [id, mid]);
  }
  res.json({ id });
}));

router.delete('/:id', requireOrganizer, ah(async (req, res) => {
  const id = Number(req.params['id']);
  const memberId = res.locals['memberId'] as number;
  const tripId = await memberTripId(memberId);

  const act = await one<{ trip_id: number }>('SELECT trip_id FROM activities WHERE id = $1', [id]);
  if (!act || act.trip_id !== tripId) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }

  await query('DELETE FROM activities WHERE id = $1', [id]);
  res.status(204).end();
}));

export default router;
