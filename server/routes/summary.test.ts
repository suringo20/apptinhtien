import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { getDb, resetDb } from '../db.js';
import bcrypt from 'bcryptjs';

let orgId: number;
let anId: number;

beforeEach(() => {
  resetDb();
  const db = getDb();
  const hash = bcrypt.hashSync('s', 10);
  const t = db
    .prepare("INSERT INTO trips (name, currency, organizer_code) VALUES ('T', '₫', ?)")
    .run(hash);
  const tid = t.lastInsertRowid as number;
  const o = db
    .prepare('INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?,?,?,?)')
    .run(tid, 'Nga', 'nga', 1);
  orgId = o.lastInsertRowid as number;
  const a = db
    .prepare('INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?,?,?,?)')
    .run(tid, 'An', 'an', 0);
  anId = a.lastInsertRowid as number;

  // Activity: 1,200,000 split between Nga + An = 600,000 each
  const act = db
    .prepare('INSERT INTO activities (trip_id, name, total_amount) VALUES (?,?,?)')
    .run(tid, 'Dinner', 1200000);
  const actId = act.lastInsertRowid as number;
  db.prepare('INSERT INTO activity_members VALUES (?,?)').run(actId, orgId);
  db.prepare('INSERT INTO activity_members VALUES (?,?)').run(actId, anId);
});

describe('summary routes', () => {
  it('GET /api/summary returns per-member totals', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/api/summary')
      .set('x-member-id', String(orgId));
    expect(res.status).toBe(200);
    const an = res.body.members.find((m: { name: string }) => m.name === 'An');
    expect(an.total).toBe(600000);
    expect(an.activities).toHaveLength(1);
  });

  it('non-organizer cannot access /api/summary', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/api/summary')
      .set('x-member-id', String(anId));
    expect(res.status).toBe(403);
  });

  it('GET /api/summary/me returns only my costs', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/api/summary/me')
      .set('x-member-id', String(anId));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(600000);
    expect(res.body.activities).toHaveLength(1);
  });
});
