// Database layer. Uses a hosted Postgres (via @vercel/postgres) when
// POSTGRES_URL is present — i.e. on Vercel — and an in-process Postgres
// (PGlite) for local development and tests, so no external DB is needed there.

export interface QueryResult<T> {
  rows: T[];
}

interface Client {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

let _client: Client | null = null;
let _ready: Promise<Client> | null = null;

async function createClient(): Promise<Client> {
  // Neon's Vercel integration may expose the connection string as POSTGRES_URL
  // or DATABASE_URL — accept either.
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (connectionString) {
    const { createPool } = await import('@vercel/postgres');
    const pool = createPool({ connectionString });
    return {
      query: (text, params) => pool.query(text, params as never[]) as never,
    };
  }
  // Local / test: in-process Postgres. In-memory unless PGLITE_PATH is set.
  // Variable specifier keeps the bundler from pulling PGlite (WASM) into the
  // production Vercel function, where this branch never runs (POSTGRES_URL set).
  const pgliteModule = '@electric-sql/pglite';
  const { PGlite } = (await import(pgliteModule)) as typeof import('@electric-sql/pglite');
  const dataDir = process.env.PGLITE_PATH;
  if (dataDir) {
    const { mkdirSync } = await import('fs');
    mkdirSync(dataDir, { recursive: true });
  }
  const pg = new PGlite(dataDir);
  return {
    query: (text, params) => pg.query(text, params) as never,
  };
}

async function init(): Promise<Client> {
  const client = await createClient();
  await migrate(client);
  _client = client;
  return client;
}

export async function getDb(): Promise<Client> {
  if (_client) return _client;
  if (!_ready) _ready = init();
  return _ready;
}

/** Convenience: run a query and return the rows. */
export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const db = await getDb();
  const res = await db.query<T>(text, params);
  return res.rows;
}

/** Convenience: run a query and return the first row (or undefined). */
export async function one<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}

/** Reset to a fresh in-process DB. Tests only (no POSTGRES_URL). */
export async function resetDb(): Promise<void> {
  _client = null;
  _ready = null;
  await getDb();
}

async function migrate(db: Client): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      contact       TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT now()
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS trips (
      id             SERIAL PRIMARY KEY,
      code           TEXT NOT NULL DEFAULT '',
      name           TEXT NOT NULL,
      start_date     TEXT,
      end_date       TEXT,
      currency       TEXT NOT NULL DEFAULT '₫',
      organizer_code TEXT NOT NULL,
      created_at     TIMESTAMPTZ DEFAULT now()
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS members (
      id           SERIAL PRIMARY KEY,
      trip_id      INTEGER NOT NULL REFERENCES trips(id),
      name         TEXT NOT NULL,
      contact      TEXT NOT NULL,
      is_organizer INTEGER NOT NULL DEFAULT 0
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id           SERIAL PRIMARY KEY,
      trip_id      INTEGER NOT NULL REFERENCES trips(id),
      name         TEXT NOT NULL,
      total_amount DOUBLE PRECISION NOT NULL
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS activity_members (
      activity_id  INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      member_id    INTEGER NOT NULL REFERENCES members(id),
      PRIMARY KEY (activity_id, member_id)
    );
  `);
  // Migration: add payer_id to activities (NULL = organizer paid, for old rows)
  await db.query(`
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS payer_id INTEGER REFERENCES members(id) ON DELETE SET NULL;
  `);
}
