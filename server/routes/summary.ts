import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

router.get('/me', (req, res) => {
  const memberId = res.locals['memberId'] as number;
  const db = getDb();

  const activities = db
    .prepare(
      `SELECT a.name, a.total_amount,
              (SELECT COUNT(*) FROM activity_members WHERE activity_id = a.id) AS participant_count
       FROM activities a
       JOIN activity_members am ON am.activity_id = a.id
       WHERE am.member_id = ?`
    )
    .all(memberId) as { name: string; total_amount: number; participant_count: number }[];

  const breakdown = activities.map((a) => ({
    name: a.name,
    share: Math.round(a.total_amount / a.participant_count),
  }));

  const total = breakdown.reduce((s, a) => s + a.share, 0);
  res.json({ total, activities: breakdown });
});

router.get('/', requireOrganizer, (req, res) => {
  const db = getDb();
  const trip = db.prepare('SELECT id FROM trips ORDER BY id DESC LIMIT 1').get() as
    | { id: number }
    | undefined;
  if (!trip) { res.status(404).json({ error: 'No trip' }); return; }

  const members = db
    .prepare('SELECT id, name FROM members WHERE trip_id = ?')
    .all(trip.id) as { id: number; name: string }[];

  const result = members.map((m) => {
    const activities = db
      .prepare(
        `SELECT a.name, a.total_amount,
                (SELECT COUNT(*) FROM activity_members WHERE activity_id = a.id) AS participant_count
         FROM activities a
         JOIN activity_members am ON am.activity_id = a.id
         WHERE am.member_id = ?`
      )
      .all(m.id) as { name: string; total_amount: number; participant_count: number }[];

    const breakdown = activities.map((a) => ({
      name: a.name,
      share: Math.round(a.total_amount / a.participant_count),
    }));
    const total = breakdown.reduce((s, a) => s + a.share, 0);
    return { ...m, total, activities: breakdown };
  });

  const grandTotal = result.reduce((s, m) => s + m.total, 0);
  res.json({ grandTotal, members: result });
});

export default router;
