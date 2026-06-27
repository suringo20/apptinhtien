import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

const router = Router();

router.post('/signin', (req, res) => {
  const { contact, orgCode } = req.body as { contact: string; orgCode?: string };
  if (!contact) {
    res.status(400).json({ error: 'contact required' });
    return;
  }

  const db = getDb();
  const trip = db.prepare('SELECT id, organizer_code FROM trips ORDER BY id DESC LIMIT 1').get() as
    | { id: number; organizer_code: string }
    | undefined;

  if (!trip) {
    console.log('No trip found');
    res.status(404).json({ error: 'No active trip' });
    return;
  }

  console.log('trip found:', trip.id, 'looking for contact:', contact);
  const member = db
    .prepare('SELECT id, is_organizer FROM members WHERE trip_id = ? AND contact = ?')
    .get(trip.id, contact) as { id: number; is_organizer: number } | undefined;

  if (!member) {
    const allMembers = db.prepare('SELECT * FROM members').all();
    console.log('Member not found. All members:', allMembers);
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  const isOrganizer = orgCode ? bcrypt.compareSync(orgCode, trip.organizer_code) : false;

  res.json({
    memberId: member.id,
    tripId: trip.id,
    isOrganizer,
  });
});

export default router;
