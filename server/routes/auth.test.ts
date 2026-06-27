import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { getDb, resetDb } from '../db.js';
import bcrypt from 'bcryptjs';

describe('POST /api/auth/signin', () => {
  beforeEach(() => {
    resetDb();
    const db = getDb();
    const hash = bcrypt.hashSync('secret123', 10);
    db.prepare(
      "INSERT INTO trips (name, currency, organizer_code) VALUES ('Da Lat', '₫', ?)"
    ).run(hash);
    const tripId = (db.prepare('SELECT id FROM trips').get() as { id: number }).id;
    db.prepare(
      'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?, ?, ?, ?)'
    ).run(tripId, 'Nga', '0901000001', 1);
    db.prepare(
      'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?, ?, ?, ?)'
    ).run(tripId, 'An', '0901000002', 0);
  });

  it('returns organizer=true when org code matches', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ name: 'Nga', contact: '0901000001', orgCode: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.isOrganizer).toBe(true);
    expect(res.body.memberId).toBeDefined();
  });

  it('returns isOrganizer=false for a regular member', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ name: 'An', contact: '0901000002' });
    expect(res.status).toBe(200);
    expect(res.body.isOrganizer).toBe(false);
  });

  it('returns 404 when contact not found', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ name: 'X', contact: '0000000000' });
    expect(res.status).toBe(404);
  });
});
