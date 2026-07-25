import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { query, one, resetDb } from '../db.js';
import bcrypt from 'bcryptjs';

let orgId: number;
let anId: number;

beforeEach(async () => {
  await resetDb();
  const hash = bcrypt.hashSync('s', 10);
  const t = await one<{ id: number }>(
    "INSERT INTO trips (name, currency, organizer_code) VALUES ('T', '₫', $1) RETURNING id",
    [hash]
  );
  const tid = t!.id;
  orgId = (await one<{ id: number }>(
    'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES ($1,$2,$3,$4) RETURNING id',
    [tid, 'Nga', 'nga', 1]
  ))!.id;
  anId = (await one<{ id: number }>(
    'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES ($1,$2,$3,$4) RETURNING id',
    [tid, 'An', 'an', 0]
  ))!.id;

  // Activity: 1,200,000 split between Nga + An = 600,000 each
  const actId = (await one<{ id: number }>(
    'INSERT INTO activities (trip_id, name, total_amount) VALUES ($1,$2,$3) RETURNING id',
    [tid, 'Dinner', 1200000]
  ))!.id;
  await query('INSERT INTO activity_members (activity_id, member_id) VALUES ($1,$2)', [actId, orgId]);
  await query('INSERT INTO activity_members (activity_id, member_id) VALUES ($1,$2)', [actId, anId]);
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
