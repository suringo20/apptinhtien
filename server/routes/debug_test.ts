import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { getDb, resetDb } from '../db.js';
import bcrypt from 'bcryptjs';

describe('debug', () => {
  beforeEach(() => {
    resetDb();
    const db = getDb();
    const hash = bcrypt.hashSync('secret123', 10);
    db.prepare("INSERT INTO trips (name, currency, organizer_code) VALUES ('Da Lat', '₫', ?)").run(hash);
    const tripId = (db.prepare('SELECT id FROM trips').get() as any).id;
    db.prepare('INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?, ?, ?, ?)').run(tripId, 'Nga', '0901000001', 1);
    
    // verify
    const trip = db.prepare('SELECT id, organizer_code FROM trips ORDER BY id DESC LIMIT 1').get() as any;
    console.log('trip:', trip);
    const member = db.prepare('SELECT id, is_organizer FROM members WHERE trip_id = ? AND contact = ?').get(trip.id, '0901000001') as any;
    console.log('member:', member);
  });

  it('debug', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/signin').send({ name: 'Nga', contact: '0901000001', orgCode: 'secret123' });
    console.log('status:', res.status, 'body:', res.body);
    expect(res.status).toBe(200);
  });
});
