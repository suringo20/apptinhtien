import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

const router = Router();

router.post('/signin', (req, res) => {
  const { contact, orgCode, tripCode } = req.body as { contact: string; orgCode?: string; tripCode: string };
  if (!contact || !tripCode) {
    res.status(400).json({ error: 'contact and tripCode required' });
    return;
  }

  const db = getDb();
  const trip = db.prepare('SELECT id, organizer_code FROM trips WHERE code = ?').get(tripCode) as
    | { id: number; organizer_code: string }
    | undefined;

  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const member = db
    .prepare('SELECT id, is_organizer FROM members WHERE trip_id = ? AND contact = ?')
    .get(trip.id, contact) as { id: number; is_organizer: number } | undefined;

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  const isOrganizer = orgCode ? bcrypt.compareSync(orgCode, trip.organizer_code) : false;

  res.json({
    memberId: member.id,
    tripId: trip.id,
    tripCode,
    isOrganizer,
  });
});

export default router;
