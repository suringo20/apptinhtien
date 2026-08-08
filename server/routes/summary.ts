import { Router } from 'express';
import { query, one } from '../db.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';
import { ah } from '../lib/asyncHandler.js';

const router = Router();
router.use(requireAuth);

interface ActivityRow {
  name: string;
  total_amount: number;
  participant_count: number;
  payer_id: number | null;
  payer_name: string | null;
}

async function getOrganizerForMember(memberId: number): Promise<{ id: number; name: string } | undefined> {
  return one<{ id: number; name: string }>(
    `SELECT m.id, m.name FROM members m
     WHERE m.trip_id = (SELECT trip_id FROM members WHERE id = $1)
       AND m.is_organizer = 1
     LIMIT 1`,
    [memberId]
  );
}

function resolveShare(row: ActivityRow, memberId: number, organizer: { id: number; name: string } | undefined) {
  const payerId = row.payer_id ?? organizer?.id ?? null;
  const payerName = row.payer_name ?? organizer?.name ?? 'organizer';
  const isPayer = payerId === memberId;
  const share = isPayer ? 0 : Math.round(row.total_amount / row.participant_count);
  return { payerId, payerName, share };
}

router.get('/me', ah(async (_req, res) => {
  const memberId = res.locals['memberId'] as number;
  const organizer = await getOrganizerForMember(memberId);

  const rows = await query<ActivityRow>(
    `SELECT a.name, a.total_amount,
            (SELECT COUNT(*)::int FROM activity_members WHERE activity_id = a.id) AS participant_count,
            a.payer_id,
            pm.name AS payer_name
     FROM activities a
     JOIN activity_members am ON am.activity_id = a.id
     LEFT JOIN members pm ON pm.id = a.payer_id
     WHERE am.member_id = $1
     ORDER BY a.id`,
    [memberId]
  );

  const activities = rows.map(r => {
    const { payerName, share } = resolveShare(r, memberId, organizer);
    return { name: r.name, share, payer_name: payerName };
  });

  const total = activities.reduce((s, a) => s + a.share, 0);
  res.json({ total, activities });
}));

router.get('/', requireOrganizer, ah(async (_req, res) => {
  const memberId = res.locals['memberId'] as number;
  const org = await one<{ trip_id: number }>('SELECT trip_id FROM members WHERE id = $1', [memberId]);
  if (!org) { res.status(404).json({ error: 'No trip' }); return; }

  const members = await query<{ id: number; name: string; is_organizer: number }>(
    'SELECT id, name, is_organizer FROM members WHERE trip_id = $1 ORDER BY id',
    [org.trip_id]
  );

  const organizer = members.find(m => m.is_organizer === 1);

  const result = [];
  for (const m of members) {
    const rows = await query<ActivityRow>(
      `SELECT a.name, a.total_amount,
              (SELECT COUNT(*)::int FROM activity_members WHERE activity_id = a.id) AS participant_count,
              a.payer_id,
              pm.name AS payer_name
       FROM activities a
       JOIN activity_members am ON am.activity_id = a.id
       LEFT JOIN members pm ON pm.id = a.payer_id
       WHERE am.member_id = $1
       ORDER BY a.id`,
      [m.id]
    );

    const activities = rows
      .map(r => {
        const { payerName, share } = resolveShare(r, m.id, organizer);
        return { name: r.name, share, payer_name: payerName };
      })
      .filter(a => a.share > 0);

    const total = activities.reduce((s, a) => s + a.share, 0);
    result.push({ id: m.id, name: m.name, total, activities });
  }

  const grandTotal = result.reduce((s, m) => s + m.total, 0);
  res.json({ grandTotal, members: result });
}));

export default router;
