import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { resetDb } from '../db.js';

const ORG_CODE = 'secret123';

describe('trip routes', () => {
  beforeEach(() => resetDb());

  it('POST /api/trip creates a trip with members', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/trip').send({
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
  });

  it('POST /api/trip returns 409 when a trip already exists', async () => {
    const app = buildApp();
    const payload = {
      name: 'Trip 1',
      currency: '₫',
      orgCode: ORG_CODE,
      members: [{ name: 'Nga', contact: '0901000001' }],
    };
    await request(app).post('/api/trip').send(payload);
    const res = await request(app).post('/api/trip').send({ ...payload, name: 'Trip 2' });
    expect(res.status).toBe(409);
  });

  it('GET /api/trip returns current trip with members', async () => {
    const app = buildApp();
    await request(app).post('/api/trip').send({
      name: 'Da Lat',
      currency: '₫',
      orgCode: ORG_CODE,
      members: [{ name: 'Nga', contact: '0901000001' }],
    });
    const res = await request(app).get('/api/trip');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Da Lat');
    expect(res.body.members).toHaveLength(1);
  });
});
