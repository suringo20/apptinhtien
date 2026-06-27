import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, 'trip.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    migrate(_db);
  }
  return _db;
}

export function resetDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
  // Use in-memory DB for tests
  process.env.DB_PATH = ':memory:';
  _db = null;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      start_date     TEXT,
      end_date       TEXT,
      currency       TEXT NOT NULL DEFAULT '₫',
      organizer_code TEXT NOT NULL,
      created_at     TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS members (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id      INTEGER NOT NULL REFERENCES trips(id),
      name         TEXT NOT NULL,
      contact      TEXT NOT NULL,
      is_organizer INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS activities (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id      INTEGER NOT NULL REFERENCES trips(id),
      name         TEXT NOT NULL,
      total_amount REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_members (
      activity_id  INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      member_id    INTEGER NOT NULL REFERENCES members(id),
      PRIMARY KEY (activity_id, member_id)
    );
  `);
}
