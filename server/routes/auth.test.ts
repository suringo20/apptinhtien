import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { resetDb } from '../db.js';

const app = () => buildApp();

async function register(contact: string, name = 'User', password = 'pw123') {
  const res = await request(app())
    .post('/api/auth/register')
    .send({ name, contact, password });
  return res;
}

describe('POST /api/auth/register', () => {
  beforeEach(async () => { await resetDb(); });

  it('creates a user and returns userId', async () => {
    const res = await register('0901000001', 'Nga');
    expect(res.status).toBe(201);
    expect(res.body.userId).toBeDefined();
  });

  it('returns 409 when the contact is already registered', async () => {
    await register('0901000001', 'Nga');
    const res = await register('0901000001', 'Someone Else');
    expect(res.status).toBe(409);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app()).post('/api/auth/register').send({ contact: '0901000001' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => { await resetDb(); });

  it('returns userId and name on correct credentials', async () => {
    await register('0901000001', 'Nga', 'secret123');
    const res = await request(app())
      .post('/api/auth/login')
      .send({ contact: '0901000001', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.userId).toBeDefined();
    expect(res.body.name).toBe('Nga');
  });

  it('returns 401 on wrong password', async () => {
    await register('0901000001', 'Nga', 'secret123');
    const res = await request(app())
      .post('/api/auth/login')
      .send({ contact: '0901000001', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for an unknown contact', async () => {
    const res = await request(app())
      .post('/api/auth/login')
      .send({ contact: '0000000000', password: 'x' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/join', () => {
  beforeEach(async () => { await resetDb(); });

  async function setupTrip() {
    // Organizer registers, then creates a trip linked to their account.
    const org = await register('0901000001', 'Nga');
    const userId = org.body.userId as number;
    const trip = await request(app()).post('/api/trip').send({
      name: 'Da Lat',
      currency: '₫',
      orgCode: 'secret123',
      userId,
      members: [{ name: 'An', contact: '0901000002' }],
    });
    return { userId, tripCode: trip.body.code as string };
  }

  it('returns organizer=true when the member is the trip organizer', async () => {
    const { userId, tripCode } = await setupTrip();
    const res = await request(app())
      .post('/api/auth/join')
      .send({ tripCode, userId });
    expect(res.status).toBe(200);
    expect(res.body.isOrganizer).toBe(true);
    expect(res.body.memberId).toBeDefined();
  });

  it('returns organizer=false for a regular member', async () => {
    const { tripCode } = await setupTrip();
    // Register the non-organizer member (contact matches a trip member).
    const an = await register('0901000002', 'An');
    const res = await request(app())
      .post('/api/auth/join')
      .send({ tripCode, userId: an.body.userId });
    expect(res.status).toBe(200);
    expect(res.body.isOrganizer).toBe(false);
  });

  it('auto-joins a stranger with a valid trip code as a non-organizer', async () => {
    const { tripCode } = await setupTrip();
    const stranger = await register('0909999999', 'Stranger');
    const res = await request(app())
      .post('/api/auth/join')
      .send({ tripCode, userId: stranger.body.userId });
    expect(res.status).toBe(200);
    expect(res.body.isOrganizer).toBe(false);
    expect(res.body.memberId).toBeDefined();
  });

  it('returns 404 for an unknown trip code', async () => {
    const { userId } = await setupTrip();
    const res = await request(app())
      .post('/api/auth/join')
      .send({ tripCode: 'NOPE99', userId });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/auth/my-trips', () => {
  beforeEach(async () => { await resetDb(); });

  it('lists trips the user belongs to', async () => {
    const org = await register('0901000001', 'Nga');
    const userId = org.body.userId as number;
    await request(app()).post('/api/trip').send({
      name: 'Da Lat',
      currency: '₫',
      orgCode: 'secret123',
      userId,
      members: [],
    });
    const res = await request(app()).get('/api/auth/my-trips').query({ userId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Da Lat');
    expect(res.body[0].is_organizer).toBe(1);
  });

  it('returns 400 without a userId', async () => {
    const res = await request(app()).get('/api/auth/my-trips');
    expect(res.status).toBe(400);
  });
});
