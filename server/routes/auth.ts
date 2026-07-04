import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, contact, password } = req.body as { name: string; contact: string; password: string };
  if (!name || !contact || !password) {
    res.status(400).json({ error: 'name, contact, and password required' });
    return;
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE contact = ?').get(contact);
  if (existing) {
    res.status(409).json({ error: 'Account already exists with this contact' });
    return;
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, contact, password_hash) VALUES (?, ?, ?)').run(name, contact, hash);
  res.status(201).json({ userId: result.lastInsertRowid });
});

router.post('/login', (req, res) => {
  const { contact, password } = req.body as { contact: string; password: string };
  if (!contact || !password) {
    res.status(400).json({ error: 'contact and password required' });
    return;
  }
  const db = getDb();
  const user = db.prepare('SELECT id, name, password_hash FROM users WHERE contact = ?').get(contact) as
    | { id: number; name: string; password_hash: string } | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid contact or password' });
    return;
  }
  res.json({ userId: user.id, name: user.name, contact });
});

// Join a trip using trip code — matches user's contact against trip members
router.post('/join', (req, res) => {
  const { tripCode, userId, orgCode } = req.body as { tripCode: string; userId: number; orgCode?: string };
  if (!tripCode || !userId) {
    res.status(400).json({ error: 'tripCode and userId required' });
    return;
  }
  const db = getDb();
  const user = db.prepare('SELECT contact FROM users WHERE id = ?').get(userId) as { contact: string } | undefined;
  if (!user) {
    res.status(401).json({ error: 'Invalid user' });
    return;
  }
  const trip = db.prepare('SELECT id, organizer_code FROM trips WHERE code = ?').get(tripCode.toUpperCase()) as
    | { id: number; organizer_code: string } | undefined;
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }
  const member = db.prepare('SELECT id, is_organizer FROM members WHERE trip_id = ? AND contact = ?')
    .get(trip.id, user.contact) as { id: number; is_organizer: number } | undefined;
  if (!member) {
    res.status(404).json({ error: 'You are not a member of this trip. Ask the organizer to add your contact.' });
    return;
  }
  const isOrganizer = orgCode ? bcrypt.compareSync(orgCode, trip.organizer_code) : false;
  res.json({ memberId: member.id, tripId: trip.id, tripCode: tripCode.toUpperCase(), isOrganizer });
});

export default router;
