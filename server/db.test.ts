import { describe, it, expect, beforeEach } from 'vitest';
import { query, one, resetDb } from './db.js';

describe('db schema', () => {
  beforeEach(async () => { await resetDb(); });

  it('creates all five tables', async () => {
    const tables = await query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`
    );
    const names = tables.map((t) => t.table_name);
    expect(names).toContain('users');
    expect(names).toContain('trips');
    expect(names).toContain('members');
    expect(names).toContain('activities');
    expect(names).toContain('activity_members');
  });

  it('inserts and retrieves a trip', async () => {
    await query("INSERT INTO trips (name, currency, organizer_code) VALUES ('Da Lat', '₫', 'hash')");
    const trip = await one<{ name: string }>('SELECT * FROM trips');
    expect(trip!.name).toBe('Da Lat');
  });
});
