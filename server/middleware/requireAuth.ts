import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const memberId = req.headers['x-member-id'];
  if (!memberId) {
    res.status(401).json({ error: 'x-member-id header required' });
    return;
  }
  const db = getDb();
  const member = db
    .prepare('SELECT id FROM members WHERE id = ?')
    .get(Number(memberId)) as { id: number } | undefined;
  if (!member) {
    res.status(401).json({ error: 'Invalid member' });
    return;
  }
  res.locals['memberId'] = member.id;
  next();
}

export function requireOrganizer(req: Request, res: Response, next: NextFunction) {
  const memberId = res.locals['memberId'] as number;
  const db = getDb();
  const member = db
    .prepare('SELECT is_organizer FROM members WHERE id = ?')
    .get(memberId) as { is_organizer: number } | undefined;
  if (!member?.is_organizer) {
    res.status(403).json({ error: 'Organizer only' });
    return;
  }
  next();
}
