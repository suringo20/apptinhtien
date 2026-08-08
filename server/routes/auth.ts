import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, one } from '../db.js';
import { ah } from '../lib/asyncHandler.js';

const router = Router();

router.post('/register', ah(async (req, res) => {
  const { name, contact, password } = req.body as { name: string; contact: string; password: string };
  if (!name || !contact || !password) {
    res.status(400).json({ error: 'name, contact, and password required' });
    return;
  }
  const existing = await one('SELECT id FROM users WHERE contact = $1', [contact]);
  if (existing) {
    res.status(409).json({ error: 'Account already exists with this contact' });
    return;
  }
  const hash = bcrypt.hashSync(password, 10);
  const row = await one<{ id: number }>(
    'INSERT INTO users (name, contact, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [name, contact, hash]
  );
  res.status(201).json({ userId: row!.id });
}));

router.post('/login', ah(async (req, res) => {
  const { contact, password } = req.body as { contact: string; password: string };
  if (!contact || !password) {
    res.status(400).json({ error: 'contact and password required' });
    return;
  }
  const user = await one<{ id: number; name: string; password_hash: string }>(
    'SELECT id, name, password_hash FROM users WHERE contact = $1',
    [contact]
  );
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid contact or password' });
    return;
  }
  res.json({ userId: user.id, name: user.name, contact });
}));

// Join a trip using trip code — matches user's contact against trip members
router.post('/join', ah(async (req, res) => {
  const { tripCode, userId, orgCode } = req.body as { tripCode: string; userId: number; orgCode?: string };
  if (!tripCode || !userId) {
    res.status(400).json({ error: 'tripCode and userId required' });
    return;
  }
  const user = await one<{ name: string; contact: string }>('SELECT name, contact FROM users WHERE id = $1', [userId]);
  if (!user) {
    res.status(401).json({ error: 'Invalid user' });
    return;
  }
  const trip = await one<{ id: number; organizer_code: string }>(
    'SELECT id, organizer_code FROM trips WHERE code = $1',
    [tripCode.toUpperCase()]
  );
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }
  let member = await one<{ id: number; is_organizer: number }>(
    'SELECT id, is_organizer FROM members WHERE trip_id = $1 AND contact = $2',
    [trip.id, user.contact]
  );
  // Auto-join: if not already a member, create a member record from the user's account
  if (!member) {
    const created = await one<{ id: number }>(
      'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES ($1, $2, $3, 0) RETURNING id',
      [trip.id, user.name, user.contact]
    );
    member = { id: created!.id, is_organizer: 0 };
  }
  // orgCode can elevate to organizer if it matches
  const isOrganizer = member.is_organizer === 1 ||
    (!!orgCode && bcrypt.compareSync(orgCode, trip.organizer_code));
  res.json({ memberId: member.id, tripId: trip.id, tripCode: tripCode.toUpperCase(), isOrganizer });
}));

// Get all trips the user is a member of (matched by contact)
router.get('/my-trips', ah(async (req, res) => {
  const userId = Number(req.query['userId']);
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  const user = await one<{ contact: string }>('SELECT contact FROM users WHERE id = $1', [userId]);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  const trips = await query(`
    SELECT t.id, t.code, t.name, t.start_date, t.end_date, t.currency, m.is_organizer
    FROM trips t
    JOIN members m ON m.trip_id = t.id AND m.contact = $1
    ORDER BY t.id DESC
  `, [user.contact]);
  res.json(trips);
}));

export default router;
