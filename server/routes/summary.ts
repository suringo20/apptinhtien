import { Router } from 'express';
import { query, one } from '../db.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';
import { ah } from '../lib/asyncHandler.js';

const router = Router();
router.use(requireAuth);

interface ActivityShare { name: string; total_amount: number; participant_count: number }

function toBreakdown(rows: ActivityShare[]) {
  const breakdown = rows.map((a) => ({
    name: a.name,
    share: Math.round(a.total_amount / a.participant_count),
  }));
  const total = breakdown.reduce((s, a) => s + a.share, 0);
  return { total, breakdown };
}

router.get('/me', ah(async (_req, res) => {
  const memberId = res.locals['memberId'] as number;

  const rows = await query<ActivityShare>(
    `SELECT a.name, a.total_amount,
            (SELECT COUNT(*)::int FROM activity_members WHERE activity_id = a.id) AS participant_count
     FROM activities a
     JOIN activity_members am ON am.activity_id = a.id
     WHERE am.member_id = $1
     ORDER BY a.id`,
    [memberId]
  );

  const { total, breakdown } = toBreakdown(rows);
  res.json({ total, activities: breakdown });
}));

router.get('/', requireOrganizer, ah(async (_req, res) => {
  const memberId = res.locals['memberId'] as number;
  const org = await one<{ trip_id: number }>('SELECT trip_id FROM members WHERE id = $1', [memberId]);
  if (!org) { res.status(404).json({ error: 'No trip' }); return; }

  const members = await query<{ id: number; name: string }>(
    'SELECT id, name FROM members WHERE trip_id = $1 ORDER BY id',
    [org.trip_id]
  );

  const result = [];
  for (const m of members) {
    const rows = await query<ActivityShare>(
      `SELECT a.name, a.total_amount,
              (SELECT COUNT(*)::int FROM activity_members WHERE activity_id = a.id) AS participant_count
       FROM activities a
       JOIN activity_members am ON am.activity_id = a.id
       WHERE am.member_id = $1
       ORDER BY a.id`,
      [m.id]
    );
    const { total, breakdown } = toBreakdown(rows);
    result.push({ ...m, total, activities: breakdown });
  }

  const grandTotal = result.reduce((s, m) => s + m.total, 0);
  res.json({ grandTotal, members: result });
}));

export default router;
