import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { getDb, resetDb } from '../db.js';
import bcrypt from 'bcryptjs';

let orgMemberId: number;
let memberMemberId: number;
let tripId: number;

beforeEach(() => {
  resetDb();
  const db = getDb();
  const hash = bcrypt.hashSync('secret', 10);
  const t = db
    .prepare("INSERT INTO trips (name, currency, organizer_code) VALUES ('T', '₫', ?)")
    .run(hash);
  tripId = t.lastInsertRowid as number;
  const o = db
    .prepare('INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?, ?, ?, ?)')
    .run(tripId, 'Nga', 'nga@x', 1);
  orgMemberId = o.lastInsertRowid as number;
  const m = db
    .prepare('INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?, ?, ?, ?)')
    .run(tripId, 'An', 'an@x', 0);
  memberMemberId = m.lastInsertRowid as number;
});

describe('activity routes', () => {
  it('POST /api/activities creates an activity', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/activities')
      .set('x-member-id', String(orgMemberId))
      .send({ name: 'Dinner', totalAmount: 1200000, memberIds: [orgMemberId, memberMemberId] });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('non-organizer cannot create activity', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/activities')
      .set('x-member-id', String(memberMemberId))
      .send({ name: 'Dinner', totalAmount: 500000, memberIds: [memberMemberId] });
    expect(res.status).toBe(403);
  });

  it('GET /api/activities returns activities with participants', async () => {
    const app = buildApp();
    await request(app)
      .post('/api/activities')
      .set('x-member-id', String(orgMemberId))
      .send({ name: 'Dinner', totalAmount: 1200000, memberIds: [orgMemberId, memberMemberId] });
    const res = await request(app)
      .get('/api/activities')
      .set('x-member-id', String(orgMemberId));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].participants).toHaveLength(2);
  });

  it('DELETE /api/activities/:id removes the activity', async () => {
    const app = buildApp();
    const created = await request(app)
      .post('/api/activities')
      .set('x-member-id', String(orgMemberId))
      .send({ name: 'Dinner', totalAmount: 1200000, memberIds: [orgMemberId] });
    const id = created.body.id;
    const res = await request(app)
      .delete(`/api/activities/${id}`)
      .set('x-member-id', String(orgMemberId));
    expect(res.status).toBe(204);
  });
});
