import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, one } from '../db.js';
import { ah } from '../lib/asyncHandler.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';

const router = Router();

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

router.post('/', ah(async (req, res) => {
  const { name, currency, orgCode, members, start_date, end_date, userId } = req.body as {
    name: string;
    currency: string;
    orgCode: string;
    members: { name: string; contact: string }[];
    start_date?: string;
    end_date?: string;
    userId?: number;
  };

  if (!name || !orgCode) {
    res.status(400).json({ error: 'name and orgCode required' });
    return;
  }

  // Resolve organizer from userId if provided
  let organizerName = '';
  let organizerContact = '';
  if (userId) {
    const user = await one<{ name: string; contact: string }>(
      'SELECT name, contact FROM users WHERE id = $1',
      [userId]
    );
    if (user) { organizerName = user.name; organizerContact = user.contact; }
  }

  const hash = bcrypt.hashSync(orgCode, 10);

  let code = generateCode();
  while (await one('SELECT id FROM trips WHERE code = $1', [code])) {
    code = generateCode();
  }

  const trip = await one<{ id: number }>(
    'INSERT INTO trips (code, name, start_date, end_date, currency, organizer_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [code, name, start_date ?? null, end_date ?? null, currency ?? '₫', hash]
  );
  const tripId = trip!.id;

  // Insert organizer first (from user account), then other members
  if (organizerContact) {
    await query(
      'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES ($1, $2, $3, $4)',
      [tripId, organizerName, organizerContact, 1]
    );
  }

  const otherMembers = (members ?? []).filter(m => m.name && m.contact && m.contact !== organizerContact);
  for (const m of otherMembers) {
    await query(
      'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES ($1, $2, $3, $4)',
      [tripId, m.name, m.contact, 0]
    );
  }

  // If no userId was provided, fall back to marking the first member as organizer
  if (!organizerContact) {
    const firstMember = await one<{ id: number }>(
      'SELECT id FROM members WHERE trip_id = $1 ORDER BY id LIMIT 1',
      [tripId]
    );
    if (firstMember) {
      await query('UPDATE members SET is_organizer = 1 WHERE id = $1', [firstMember.id]);
    }
  }

  res.status(201).json({ id: tripId, code });
}));

router.get('/', ah(async (req, res) => {
  const { code } = req.query as { code?: string };

  let trip: Record<string, unknown> | undefined;
  if (code) {
    trip = await one('SELECT * FROM trips WHERE code = $1', [code]);
  } else {
    // Fall back to the trip scoped by the member's trip_id (via auth header)
    const memberId = req.headers['x-member-id'];
    if (memberId) {
      const member = await one<{ trip_id: number }>(
        'SELECT trip_id FROM members WHERE id = $1',
        [Number(memberId)]
      );
      if (member) {
        trip = await one('SELECT * FROM trips WHERE id = $1', [member.trip_id]);
      }
    }
  }

  if (!trip) {
    res.status(404).json({ error: 'No active trip' });
    return;
  }
  const members = await query(
    'SELECT id, name, contact, is_organizer FROM members WHERE trip_id = $1 ORDER BY id',
    [trip['id']]
  );
  res.json({ ...trip, members });
}));

// Organizer adds a new member to the current trip
router.post('/members', requireAuth, requireOrganizer, ah(async (_req, res) => {
  const { name, contact } = _req.body as { name: string; contact: string };
  if (!name || !contact) {
    res.status(400).json({ error: 'name and contact required' });
    return;
  }
  const memberId = res.locals['memberId'] as number;
  const self = await one<{ trip_id: number }>('SELECT trip_id FROM members WHERE id = $1', [memberId]);
  const tripId = self!.trip_id;
  const existing = await one('SELECT id FROM members WHERE trip_id = $1 AND contact = $2', [tripId, contact]);
  if (existing) {
    res.status(409).json({ error: 'This person is already in the trip' });
    return;
  }
  const created = await one<{ id: number }>(
    'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES ($1, $2, $3, 0) RETURNING id',
    [tripId, name, contact]
  );
  res.status(201).json({ id: created!.id, name, contact, is_organizer: 0 });
}));

// Organizer removes a member from the current trip (cannot remove organizers)
router.delete('/members/:memberId', requireAuth, requireOrganizer, ah(async (req, res) => {
  const selfId = res.locals['memberId'] as number;
  const self = await one<{ trip_id: number }>('SELECT trip_id FROM members WHERE id = $1', [selfId]);
  const tripId = self!.trip_id;
  const targetId = Number(req.params['memberId']);
  const target = await one<{ trip_id: number; is_organizer: number }>(
    'SELECT trip_id, is_organizer FROM members WHERE id = $1',
    [targetId]
  );
  if (!target || target.trip_id !== tripId) {
    res.status(404).json({ error: 'Member not found in this trip' });
    return;
  }
  if (target.is_organizer) {
    res.status(400).json({ error: 'Cannot remove the organizer' });
    return;
  }
  await query('DELETE FROM members WHERE id = $1', [targetId]);
  res.status(204).end();
}));

// Organizer deletes the entire trip and all its data
router.delete('/', requireAuth, requireOrganizer, ah(async (_req, res) => {
  const memberId = res.locals['memberId'] as number;
  const self = await one<{ trip_id: number }>('SELECT trip_id FROM members WHERE id = $1', [memberId]);
  const tripId = self!.trip_id;
  await query('DELETE FROM activities WHERE trip_id = $1', [tripId]);
  await query('DELETE FROM members WHERE trip_id = $1', [tripId]);
  await query('DELETE FROM trips WHERE id = $1', [tripId]);
  res.status(204).end();
}));

export default router;
