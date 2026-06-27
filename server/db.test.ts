import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from './db.js';

describe('db schema', () => {
  beforeEach(() => resetDb());

  it('creates all four tables', () => {
    const db = getDb();
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const names = tables.map((t) => t.name);
    expect(names).toContain('trips');
    expect(names).toContain('members');
    expect(names).toContain('activities');
    expect(names).toContain('activity_members');
  });

  it('inserts and retrieves a trip', () => {
    const db = getDb();
    db.prepare(
      "INSERT INTO trips (name, currency, organizer_code) VALUES ('Da Lat', '₫', 'hash')"
    ).run();
    const trip = db.prepare('SELECT * FROM trips').get() as { name: string };
    expect(trip.name).toBe('Da Lat');
  });
});
