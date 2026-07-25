import { one } from '../db.js';
import { ah } from '../lib/asyncHandler.js';

export const requireAuth = ah(async (req, res, next) => {
  const memberId = req.headers['x-member-id'];
  if (!memberId) {
    res.status(401).json({ error: 'x-member-id header required' });
    return;
  }
  const member = await one<{ id: number }>('SELECT id FROM members WHERE id = $1', [Number(memberId)]);
  if (!member) {
    res.status(401).json({ error: 'Invalid member' });
    return;
  }
  res.locals['memberId'] = member.id;
  next();
});

export const requireOrganizer = ah(async (_req, res, next) => {
  const memberId = res.locals['memberId'] as number;
  const member = await one<{ is_organizer: number }>(
    'SELECT is_organizer FROM members WHERE id = $1',
    [memberId]
  );
  if (!member?.is_organizer) {
    res.status(403).json({ error: 'Organizer only' });
    return;
  }
  next();
});
