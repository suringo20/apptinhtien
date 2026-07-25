import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { resetDb } from '../db.js';

const ORG_CODE = 'secret123';
const app = () => buildApp();

describe('trip routes', () => {
  beforeEach(() => resetDb());

  it('POST /api/trip creates a trip and returns an id and code', async () => {
    const res = await request(app()).post('/api/trip').send({
      name: 'Da Lat',
      currency: '₫',
      orgCode: ORG_CODE,
      members: [
        { name: 'Nga', contact: '0901000001' },
        { name: 'An', contact: '0901000002' },
      ],
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('POST /api/trip supports multiple trips (no single-trip lock)', async () => {
    const payload = {
      name: 'Trip 1',
      currency: '₫',
      orgCode: ORG_CODE,
      members: [{ name: 'Nga', contact: '0901000001' }],
    };
    const first = await request(app()).post('/api/trip').send(payload);
    const second = await request(app()).post('/api/trip').send({ ...payload, name: 'Trip 2' });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.code).not.toBe(first.body.code);
  });

  it('POST /api/trip returns 400 when name or orgCode is missing', async () => {
    const res = await request(app()).post('/api/trip').send({ currency: '₫', members: [] });
    expect(res.status).toBe(400);
  });

  it('GET /api/trip?code=... returns that trip with members', async () => {
    const created = await request(app()).post('/api/trip').send({
      name: 'Da Lat',
      currency: '₫',
      orgCode: ORG_CODE,
      members: [{ name: 'Nga', contact: '0901000001' }],
    });
    const res = await request(app()).get('/api/trip').query({ code: created.body.code });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Da Lat');
    expect(res.body.members).toHaveLength(1);
  });

  it('GET /api/trip resolves the trip from the x-member-id header', async () => {
    const created = await request(app()).post('/api/trip').send({
      name: 'Da Lat',
      currency: '₫',
      orgCode: ORG_CODE,
      members: [{ name: 'Nga', contact: '0901000001' }],
    });
    const trip = await request(app()).get('/api/trip').query({ code: created.body.code });
    const memberId = trip.body.members[0].id;
    const res = await request(app()).get('/api/trip').set('x-member-id', String(memberId));
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Da Lat');
  });

  it('GET /api/trip returns 404 with no code and no member context', async () => {
    const res = await request(app()).get('/api/trip');
    expect(res.status).toBe(404);
  });
});
