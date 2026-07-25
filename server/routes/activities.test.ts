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

describe('activity routes — multi-trip isolation', () => {
  let tripB: number;
  let orgB: number;

  beforeEach(() => {
    // A SECOND, newer trip exists — this used to hijack "latest trip" logic.
    const db = getDb();
    const hash = bcrypt.hashSync('s', 10);
    const t = db.prepare("INSERT INTO trips (name, currency, organizer_code) VALUES ('B', '₫', ?)").run(hash);
    tripB = t.lastInsertRowid as number;
    orgB = db.prepare('INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?,?,?,?)')
      .run(tripB, 'Bob', 'bob@x', 1).lastInsertRowid as number;
  });

  it('POST attaches the activity to the organizer\'s OWN trip, not the newest one', async () => {
    const app = buildApp();
    const created = await request(app)
      .post('/api/activities')
      .set('x-member-id', String(orgMemberId)) // organizer of trip A (older)
      .send({ name: 'AliceDinner', totalAmount: 100, memberIds: [orgMemberId] });
    expect(created.status).toBe(201);
    const row = getDb().prepare('SELECT trip_id FROM activities WHERE id = ?').get(created.body.id) as { trip_id: number };
    expect(row.trip_id).toBe(tripId); // trip A, not trip B
  });

  it('GET only returns the caller\'s own trip activities', async () => {
    const app = buildApp();
    await request(app).post('/api/activities').set('x-member-id', String(orgMemberId))
      .send({ name: 'A-thing', totalAmount: 100, memberIds: [orgMemberId] });
    await request(app).post('/api/activities').set('x-member-id', String(orgB))
      .send({ name: 'B-thing', totalAmount: 200, memberIds: [orgB] });

    const aList = await request(app).get('/api/activities').set('x-member-id', String(orgMemberId));
    const bList = await request(app).get('/api/activities').set('x-member-id', String(orgB));
    expect(aList.body.map((x: { name: string }) => x.name)).toEqual(['A-thing']);
    expect(bList.body.map((x: { name: string }) => x.name)).toEqual(['B-thing']);
  });

  it('cannot delete an activity belonging to another trip', async () => {
    const app = buildApp();
    const created = await request(app).post('/api/activities').set('x-member-id', String(orgB))
      .send({ name: 'B-only', totalAmount: 100, memberIds: [orgB] });
    // Trip A organizer tries to delete trip B's activity
    const res = await request(app).delete(`/api/activities/${created.body.id}`).set('x-member-id', String(orgMemberId));
    expect(res.status).toBe(404);
    // still there
    expect(getDb().prepare('SELECT id FROM activities WHERE id = ?').get(created.body.id)).toBeTruthy();
  });

  it('rejects participants who are not members of the trip', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/activities').set('x-member-id', String(orgMemberId))
      .send({ name: 'X', totalAmount: 100, memberIds: [orgB] }); // orgB belongs to trip B
    expect(res.status).toBe(400);
  });
});
