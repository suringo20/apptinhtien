# Trip Expense Splitter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-optimized web app where Nga enters trip activities + participants and the system splits costs equally; members log in to view their own share.

**Architecture:** React + Vite frontend (port 5173 in dev) communicates with Express + SQLite backend (port 3000) via a Vite proxy. In production, Express serves the built React files on port 3000.

**Tech Stack:** Node.js 20, TypeScript, Express 4, better-sqlite3, bcryptjs, React 18, React Router 6, Vite 5, Vitest, Supertest, @testing-library/react

---

## File Map

```
trip-splitter/
├── package.json                          # root: concurrently dev script
├── client/
│   ├── package.json
│   ├── vite.config.ts                    # proxy /api → :3000
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                       # router + route guards
│       ├── index.css                     # design tokens + reset
│       ├── types.ts                      # shared TS types
│       ├── api.ts                        # typed fetch wrapper
│       ├── lib/
│       │   └── auth.ts                   # localStorage helpers
│       ├── components/
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   ├── Chip.tsx
│       │   ├── Field.tsx                 # labeled input
│       │   └── MobileShell.tsx           # max-width mobile container
│       └── pages/
│           ├── SignIn.tsx
│           ├── CreateTrip.tsx
│           ├── Dashboard.tsx
│           ├── AddActivity.tsx
│           ├── Summary.tsx
│           └── MyCosts.tsx
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── index.ts                          # Express app entry
    ├── db.ts                             # schema + connection singleton
    ├── middleware/
    │   └── requireAuth.ts               # validates x-member-id header
    └── routes/
        ├── auth.ts
        ├── trip.ts
        ├── activities.ts
        └── summary.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (root)
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `client/package.json`
- Create: `client/vite.config.ts`
- Create: `client/index.html`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "trip-splitter",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "build": "npm run build --prefix client",
    "start": "npm run start --prefix server"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create server/package.json**

```json
{
  "name": "trip-splitter-server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/better-sqlite3": "^7.6.8",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/supertest": "^6.0.2",
    "supertest": "^6.3.4",
    "tsx": "^4.7.1",
    "typescript": "^5.4.2",
    "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 3: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create client/package.json**

```json
{
  "name": "trip-splitter-client",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.2",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "jsdom": "^24.0.0",
    "typescript": "^5.4.2",
    "vite": "^5.1.6",
    "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 5: Create client/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
```

- [ ] **Step 6: Create client/src/test-setup.ts**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 7: Create client/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet" />
    <title>Trip Splitter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Install dependencies**

```bash
npm install
npm install --prefix server
npm install --prefix client
```

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold monorepo with server + client"
```

---

## Task 2: Database Schema

**Files:**
- Create: `server/db.ts`
- Create: `server/db.test.ts`

- [ ] **Step 1: Write failing test**

Create `server/db.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd server && npm test -- db.test
```

Expected: FAIL — `Cannot find module './db.js'`

- [ ] **Step 3: Create server/db.ts**

```typescript
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
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
cd server && npm test -- db.test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/db.ts server/db.test.ts
git commit -m "feat: sqlite schema with trips, members, activities, activity_members"
```

---

## Task 3: Auth Route

**Files:**
- Create: `server/routes/auth.ts`
- Create: `server/routes/auth.test.ts`
- Create: `server/index.ts` (skeleton — expanded later)

- [ ] **Step 1: Write failing tests**

Create `server/routes/auth.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd server && npm test -- auth.test
```

Expected: FAIL — `Cannot find module '../index.js'`

- [ ] **Step 3: Create server/index.ts (skeleton)**

```typescript
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
}

const PORT = process.env.PORT ?? 3000;
const app = buildApp();
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
```

- [ ] **Step 4: Create server/routes/auth.ts**

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

const router = Router();

router.post('/signin', (req, res) => {
  const { contact, orgCode } = req.body as { contact: string; orgCode?: string };
  if (!contact) {
    res.status(400).json({ error: 'contact required' });
    return;
  }

  const db = getDb();
  const trip = db.prepare('SELECT id, organizer_code FROM trips ORDER BY id DESC LIMIT 1').get() as
    | { id: number; organizer_code: string }
    | undefined;

  if (!trip) {
    res.status(404).json({ error: 'No active trip' });
    return;
  }

  const member = db
    .prepare('SELECT id, is_organizer FROM members WHERE trip_id = ? AND contact = ?')
    .get(trip.id, contact) as { id: number; is_organizer: number } | undefined;

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  const isOrganizer = orgCode ? bcrypt.compareSync(orgCode, trip.organizer_code) : false;

  res.json({
    memberId: member.id,
    tripId: trip.id,
    isOrganizer,
  });
});

export default router;
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
cd server && npm test -- auth.test
```

Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add server/index.ts server/routes/auth.ts server/routes/auth.test.ts
git commit -m "feat: POST /api/auth/signin with bcrypt org-code check"
```

---

## Task 4: Trip Routes

**Files:**
- Create: `server/routes/trip.ts`
- Create: `server/routes/trip.test.ts`
- Modify: `server/index.ts`

- [ ] **Step 1: Write failing tests**

Create `server/routes/trip.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd server && npm test -- trip.test
```

Expected: FAIL — routes not found

- [ ] **Step 3: Create server/routes/trip.ts**

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { name, currency, orgCode, members, start_date, end_date } = req.body as {
    name: string;
    currency: string;
    orgCode: string;
    members: { name: string; contact: string }[];
    start_date?: string;
    end_date?: string;
  };

  if (!name || !orgCode || !members?.length) {
    res.status(400).json({ error: 'name, orgCode, and members required' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM trips LIMIT 1').get();
  if (existing) {
    res.status(409).json({ error: 'A trip already exists' });
    return;
  }

  const hash = bcrypt.hashSync(orgCode, 10);
  const result = db
    .prepare(
      'INSERT INTO trips (name, start_date, end_date, currency, organizer_code) VALUES (?, ?, ?, ?, ?)'
    )
    .run(name, start_date ?? null, end_date ?? null, currency ?? '₫', hash);

  const tripId = result.lastInsertRowid as number;

  const insertMember = db.prepare(
    'INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?, ?, ?, ?)'
  );
  for (const m of members) {
    insertMember.run(tripId, m.name, m.contact, 0);
  }
  // First member (organizer) flagged
  db.prepare('UPDATE members SET is_organizer = 1 WHERE trip_id = ? ORDER BY id LIMIT 1').run(
    tripId
  );

  res.status(201).json({ id: tripId });
});

router.get('/', (req, res) => {
  const db = getDb();
  const trip = db.prepare('SELECT * FROM trips ORDER BY id DESC LIMIT 1').get() as
    | Record<string, unknown>
    | undefined;
  if (!trip) {
    res.status(404).json({ error: 'No active trip' });
    return;
  }
  const members = db
    .prepare('SELECT id, name, contact, is_organizer FROM members WHERE trip_id = ?')
    .all(trip['id']);
  res.json({ ...trip, members });
});

export default router;
```

- [ ] **Step 4: Wire trip router into server/index.ts**

Replace the contents of `server/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import tripRouter from './routes/trip.js';

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trip', tripRouter);
  return app;
}

const PORT = process.env.PORT ?? 3000;
const app = buildApp();
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
```

- [ ] **Step 5: Run tests**

```bash
cd server && npm test -- trip.test
```

Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add server/routes/trip.ts server/routes/trip.test.ts server/index.ts
git commit -m "feat: GET/POST /api/trip with member seeding"
```

---

## Task 5: Activity Routes

**Files:**
- Create: `server/middleware/requireAuth.ts`
- Create: `server/routes/activities.ts`
- Create: `server/routes/activities.test.ts`
- Modify: `server/index.ts`

- [ ] **Step 1: Create server/middleware/requireAuth.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const memberId = req.headers['x-member-id'];
  if (!memberId) {
    res.status(401).json({ error: 'x-member-id header required' });
    return;
  }
  const db = getDb();
  const member = db
    .prepare('SELECT id FROM members WHERE id = ?')
    .get(Number(memberId)) as { id: number } | undefined;
  if (!member) {
    res.status(401).json({ error: 'Invalid member' });
    return;
  }
  res.locals['memberId'] = member.id;
  next();
}

export function requireOrganizer(req: Request, res: Response, next: NextFunction) {
  const memberId = res.locals['memberId'] as number;
  const db = getDb();
  const member = db
    .prepare('SELECT is_organizer FROM members WHERE id = ?')
    .get(memberId) as { is_organizer: number } | undefined;
  if (!member?.is_organizer) {
    res.status(403).json({ error: 'Organizer only' });
    return;
  }
  next();
}
```

- [ ] **Step 2: Write failing tests**

Create `server/routes/activities.test.ts`:

```typescript
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
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
cd server && npm test -- activities.test
```

Expected: FAIL

- [ ] **Step 4: Create server/routes/activities.ts**

```typescript
import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const db = getDb();
  const trip = db.prepare('SELECT id FROM trips ORDER BY id DESC LIMIT 1').get() as
    | { id: number }
    | undefined;
  if (!trip) { res.status(404).json({ error: 'No trip' }); return; }

  const activities = db
    .prepare('SELECT * FROM activities WHERE trip_id = ?')
    .all(trip.id) as { id: number; name: string; total_amount: number }[];

  const result = activities.map((a) => {
    const participants = db
      .prepare(
        `SELECT m.id, m.name FROM members m
         JOIN activity_members am ON am.member_id = m.id
         WHERE am.activity_id = ?`
      )
      .all(a.id) as { id: number; name: string }[];
    return { ...a, participants };
  });

  res.json(result);
});

router.post('/', requireOrganizer, (req, res) => {
  const { name, totalAmount, memberIds } = req.body as {
    name: string;
    totalAmount: number;
    memberIds: number[];
  };
  if (!name || !totalAmount || !memberIds?.length) {
    res.status(400).json({ error: 'name, totalAmount, memberIds required' });
    return;
  }

  const db = getDb();
  const trip = db.prepare('SELECT id FROM trips ORDER BY id DESC LIMIT 1').get() as
    | { id: number }
    | undefined;
  if (!trip) { res.status(404).json({ error: 'No trip' }); return; }

  const act = db
    .prepare('INSERT INTO activities (trip_id, name, total_amount) VALUES (?, ?, ?)')
    .run(trip.id, name, totalAmount);
  const actId = act.lastInsertRowid as number;

  const ins = db.prepare('INSERT INTO activity_members (activity_id, member_id) VALUES (?, ?)');
  for (const mid of memberIds) ins.run(actId, mid);

  res.status(201).json({ id: actId });
});

router.put('/:id', requireOrganizer, (req, res) => {
  const id = Number(req.params['id']);
  const { name, totalAmount, memberIds } = req.body as {
    name: string;
    totalAmount: number;
    memberIds: number[];
  };
  const db = getDb();
  db.prepare('UPDATE activities SET name = ?, total_amount = ? WHERE id = ?').run(
    name,
    totalAmount,
    id
  );
  db.prepare('DELETE FROM activity_members WHERE activity_id = ?').run(id);
  const ins = db.prepare('INSERT INTO activity_members (activity_id, member_id) VALUES (?, ?)');
  for (const mid of memberIds) ins.run(id, mid);
  res.json({ id });
});

router.delete('/:id', requireOrganizer, (req, res) => {
  const id = Number(req.params['id']);
  const db = getDb();
  db.prepare('DELETE FROM activities WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
```

- [ ] **Step 5: Wire into server/index.ts**

```typescript
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import tripRouter from './routes/trip.js';
import activitiesRouter from './routes/activities.js';

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trip', tripRouter);
  app.use('/api/activities', activitiesRouter);
  return app;
}

const PORT = process.env.PORT ?? 3000;
const app = buildApp();
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
```

- [ ] **Step 6: Run tests**

```bash
cd server && npm test -- activities.test
```

Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add server/middleware/requireAuth.ts server/routes/activities.ts server/routes/activities.test.ts server/index.ts
git commit -m "feat: activity CRUD with organizer guard"
```

---

## Task 6: Summary Routes

**Files:**
- Create: `server/routes/summary.ts`
- Create: `server/routes/summary.test.ts`
- Modify: `server/index.ts`

- [ ] **Step 1: Write failing tests**

Create `server/routes/summary.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { getDb, resetDb } from '../db.js';
import bcrypt from 'bcryptjs';

let orgId: number;
let anId: number;

beforeEach(() => {
  resetDb();
  const db = getDb();
  const hash = bcrypt.hashSync('s', 10);
  const t = db
    .prepare("INSERT INTO trips (name, currency, organizer_code) VALUES ('T', '₫', ?)")
    .run(hash);
  const tid = t.lastInsertRowid as number;
  const o = db
    .prepare('INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?,?,?,?)')
    .run(tid, 'Nga', 'nga', 1);
  orgId = o.lastInsertRowid as number;
  const a = db
    .prepare('INSERT INTO members (trip_id, name, contact, is_organizer) VALUES (?,?,?,?)')
    .run(tid, 'An', 'an', 0);
  anId = a.lastInsertRowid as number;

  // Activity: 1,200,000 split between Nga + An = 600,000 each
  const act = db
    .prepare('INSERT INTO activities (trip_id, name, total_amount) VALUES (?,?,?)')
    .run(tid, 'Dinner', 1200000);
  const actId = act.lastInsertRowid as number;
  db.prepare('INSERT INTO activity_members VALUES (?,?)').run(actId, orgId);
  db.prepare('INSERT INTO activity_members VALUES (?,?)').run(actId, anId);
});

describe('summary routes', () => {
  it('GET /api/summary returns per-member totals', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/api/summary')
      .set('x-member-id', String(orgId));
    expect(res.status).toBe(200);
    const an = res.body.members.find((m: { name: string }) => m.name === 'An');
    expect(an.total).toBe(600000);
    expect(an.activities).toHaveLength(1);
  });

  it('non-organizer cannot access /api/summary', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/api/summary')
      .set('x-member-id', String(anId));
    expect(res.status).toBe(403);
  });

  it('GET /api/summary/me returns only my costs', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/api/summary/me')
      .set('x-member-id', String(anId));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(600000);
    expect(res.body.activities).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd server && npm test -- summary.test
```

Expected: FAIL

- [ ] **Step 3: Create server/routes/summary.ts**

```typescript
import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireOrganizer } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

router.get('/me', (req, res) => {
  const memberId = res.locals['memberId'] as number;
  const db = getDb();

  const activities = db
    .prepare(
      `SELECT a.name, a.total_amount,
              (SELECT COUNT(*) FROM activity_members WHERE activity_id = a.id) AS participant_count
       FROM activities a
       JOIN activity_members am ON am.activity_id = a.id
       WHERE am.member_id = ?`
    )
    .all(memberId) as { name: string; total_amount: number; participant_count: number }[];

  const breakdown = activities.map((a) => ({
    name: a.name,
    share: Math.round(a.total_amount / a.participant_count),
  }));

  const total = breakdown.reduce((s, a) => s + a.share, 0);
  res.json({ total, activities: breakdown });
});

router.get('/', requireOrganizer, (req, res) => {
  const db = getDb();
  const trip = db.prepare('SELECT id FROM trips ORDER BY id DESC LIMIT 1').get() as
    | { id: number }
    | undefined;
  if (!trip) { res.status(404).json({ error: 'No trip' }); return; }

  const members = db
    .prepare('SELECT id, name FROM members WHERE trip_id = ?')
    .all(trip.id) as { id: number; name: string }[];

  const result = members.map((m) => {
    const activities = db
      .prepare(
        `SELECT a.name, a.total_amount,
                (SELECT COUNT(*) FROM activity_members WHERE activity_id = a.id) AS participant_count
         FROM activities a
         JOIN activity_members am ON am.activity_id = a.id
         WHERE am.member_id = ?`
      )
      .all(m.id) as { name: string; total_amount: number; participant_count: number }[];

    const breakdown = activities.map((a) => ({
      name: a.name,
      share: Math.round(a.total_amount / a.participant_count),
    }));
    const total = breakdown.reduce((s, a) => s + a.share, 0);
    return { ...m, total, activities: breakdown };
  });

  const grandTotal = result.reduce((s, m) => s + m.total, 0);
  res.json({ grandTotal, members: result });
});

export default router;
```

- [ ] **Step 4: Wire into server/index.ts**

```typescript
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import tripRouter from './routes/trip.js';
import activitiesRouter from './routes/activities.js';
import summaryRouter from './routes/summary.js';

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trip', tripRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/api/summary', summaryRouter);
  return app;
}

const PORT = process.env.PORT ?? 3000;
const app = buildApp();
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
```

- [ ] **Step 5: Run tests**

```bash
cd server && npm test -- summary.test
```

Expected: PASS (3 tests)

- [ ] **Step 6: Run all server tests**

```bash
cd server && npm test
```

Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add server/routes/summary.ts server/routes/summary.test.ts server/index.ts
git commit -m "feat: GET /api/summary and /api/summary/me with equal-split calculation"
```

---

## Task 7: Client Foundation

**Files:**
- Create: `client/src/types.ts`
- Create: `client/src/api.ts`
- Create: `client/src/lib/auth.ts`
- Create: `client/src/index.css`
- Create: `client/src/components/Button.tsx`
- Create: `client/src/components/Card.tsx`
- Create: `client/src/components/Chip.tsx`
- Create: `client/src/components/Field.tsx`
- Create: `client/src/components/MobileShell.tsx`
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`

- [ ] **Step 1: Create client/src/types.ts**

```typescript
export interface Member {
  id: number;
  name: string;
  contact: string;
  is_organizer: number;
}

export interface Trip {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  currency: string;
  members: Member[];
}

export interface Activity {
  id: number;
  name: string;
  total_amount: number;
  participants: { id: number; name: string }[];
}

export interface SummaryMember {
  id: number;
  name: string;
  total: number;
  activities: { name: string; share: number }[];
}

export interface Summary {
  grandTotal: number;
  members: SummaryMember[];
}

export interface MyCosts {
  total: number;
  activities: { name: string; share: number }[];
}

export interface AuthResult {
  memberId: number;
  tripId: number;
  isOrganizer: boolean;
}
```

- [ ] **Step 2: Create client/src/lib/auth.ts**

```typescript
import type { AuthResult } from '../types';

const KEY = 'trip_auth';

export function saveAuth(data: AuthResult): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAuth(): AuthResult | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as AuthResult) : null;
}

export function clearAuth(): void {
  localStorage.removeItem(KEY);
}
```

- [ ] **Step 3: Create client/src/api.ts**

```typescript
import { getAuth } from './lib/auth';
import type { Trip, Activity, Summary, MyCosts, AuthResult } from './types';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const auth = getAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(auth ? { 'x-member-id': String(auth.memberId) } : {}),
  };
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  signIn: (body: { name: string; contact: string; orgCode?: string }) =>
    apiFetch<AuthResult>('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),

  getTrip: () => apiFetch<Trip>('/trip'),

  createTrip: (body: {
    name: string;
    currency: string;
    orgCode: string;
    members: { name: string; contact: string }[];
    start_date?: string;
    end_date?: string;
  }) => apiFetch<{ id: number }>('/trip', { method: 'POST', body: JSON.stringify(body) }),

  getActivities: () => apiFetch<Activity[]>('/activities'),

  createActivity: (body: { name: string; totalAmount: number; memberIds: number[] }) =>
    apiFetch<{ id: number }>('/activities', { method: 'POST', body: JSON.stringify(body) }),

  updateActivity: (id: number, body: { name: string; totalAmount: number; memberIds: number[] }) =>
    apiFetch<{ id: number }>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteActivity: (id: number) =>
    apiFetch<void>(`/activities/${id}`, { method: 'DELETE' }),

  getSummary: () => apiFetch<Summary>('/summary'),

  getMyCosts: () => apiFetch<MyCosts>('/summary/me'),
};
```

- [ ] **Step 4: Create client/src/index.css**

```css
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Patrick Hand', system-ui, sans-serif;
  background: #ecebe7;
  color: #2b2b2b;
  -webkit-font-smoothing: antialiased;
}

:root {
  --blue: #4a73c4;
  --blue-dark: #2b56a0;
  --blue-bg: #eef3fc;
  --card-bg: #fdfdfb;
  --border: #2b2b2b;
  --border-light: #e2e1db;
  --text-muted: #9a9a96;
  --yellow-bg: #fdf3c7;
  --yellow-border: #ddca73;
  --yellow-text: #7a6a1c;
}
```

- [ ] **Step 5: Create client/src/components/MobileShell.tsx**

```tsx
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '0 0 40px' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '16px 16px 0' }}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create client/src/components/Button.tsx**

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export function Button({ variant = 'primary', style, children, ...rest }: ButtonProps) {
  const base: React.CSSProperties = {
    width: '100%',
    border: '2.5px solid var(--border)',
    borderRadius: 13,
    padding: '11px 16px',
    fontSize: 18,
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '2.5px 2.5px 0 var(--border)',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--blue)', color: '#fff' },
    outline: { background: '#fff', color: 'var(--border)' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
}
```

- [ ] **Step 7: Create client/src/components/Card.tsx**

```tsx
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '2px solid var(--border-light)',
      borderRadius: 12,
      padding: '10px 12px',
      ...style,
    }}>
      {children}
    </div>
  );
}
```

- [ ] **Step 8: Create client/src/components/Chip.tsx**

```tsx
interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        border: selected ? '2px solid var(--border)' : '2px dashed #bdbcb6',
        borderRadius: 20,
        padding: '7px 13px',
        fontSize: 15,
        fontFamily: 'inherit',
        cursor: 'pointer',
        background: selected ? 'var(--blue)' : '#fff',
        color: selected ? '#fff' : '#8a8a86',
        boxShadow: selected ? '1.5px 1.5px 0 var(--border)' : 'none',
      }}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 9: Create client/src/components/Field.tsx**

```tsx
interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 3px 2px' }}>{label}</p>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        border: '2px solid #d3d2cc',
        borderRadius: 11,
        padding: '9px 12px',
        fontSize: 17,
        fontFamily: 'inherit',
        background: '#fff',
        outline: 'none',
        ...props.style,
      }}
    />
  );
}
```

- [ ] **Step 10: Create client/src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 11: Create client/src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth } from './lib/auth';
import { SignIn } from './pages/SignIn';
import { CreateTrip } from './pages/CreateTrip';
import { Dashboard } from './pages/Dashboard';
import { AddActivity } from './pages/AddActivity';
import { Summary } from './pages/Summary';
import { MyCosts } from './pages/MyCosts';

function OrganizerRoute({ children }: { children: React.ReactNode }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/" replace />;
  if (!auth.isOrganizer) return <Navigate to="/me" replace />;
  return <>{children}</>;
}

function MemberRoute({ children }: { children: React.ReactNode }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/trip/new" element={<OrganizerRoute><CreateTrip /></OrganizerRoute>} />
        <Route path="/trip" element={<OrganizerRoute><Dashboard /></OrganizerRoute>} />
        <Route path="/trip/activity/new" element={<OrganizerRoute><AddActivity /></OrganizerRoute>} />
        <Route path="/trip/activity/:id/edit" element={<OrganizerRoute><AddActivity /></OrganizerRoute>} />
        <Route path="/trip/summary" element={<OrganizerRoute><Summary /></OrganizerRoute>} />
        <Route path="/me" element={<MemberRoute><MyCosts /></MemberRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 12: Create placeholder page files so the app compiles**

Create `client/src/pages/SignIn.tsx`, `CreateTrip.tsx`, `Dashboard.tsx`, `AddActivity.tsx`, `Summary.tsx`, `MyCosts.tsx` — each with a minimal export:

```tsx
// e.g. client/src/pages/SignIn.tsx
export function SignIn() { return <div>SignIn</div>; }
```

Repeat for each page (CreateTrip, Dashboard, AddActivity, Summary, MyCosts).

- [ ] **Step 13: Verify client compiles**

```bash
cd client && npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 14: Commit**

```bash
git add client/
git commit -m "feat: client foundation — types, api wrapper, auth helpers, shared components, router"
```

---

## Task 8: SignIn Page

**Files:**
- Modify: `client/src/pages/SignIn.tsx`
- Create: `client/src/pages/SignIn.test.tsx`

- [ ] **Step 1: Write failing test**

Create `client/src/pages/SignIn.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SignIn } from './SignIn';
import * as apiModule from '../api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  localStorage.clear();
  mockNavigate.mockReset();
});

describe('SignIn', () => {
  it('navigates organizer to /trip after sign-in with org code', async () => {
    vi.spyOn(apiModule.api, 'signIn').mockResolvedValue({
      memberId: 1, tripId: 1, isOrganizer: true,
    });
    render(<MemoryRouter><SignIn /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Nga' } });
    fireEvent.change(screen.getByPlaceholderText('Phone or email'), { target: { value: '0901' } });
    fireEvent.change(screen.getByPlaceholderText('Organizer code (optional)'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByText('Continue →'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/trip'));
  });

  it('navigates member to /me after sign-in without org code', async () => {
    vi.spyOn(apiModule.api, 'signIn').mockResolvedValue({
      memberId: 2, tripId: 1, isOrganizer: false,
    });
    render(<MemoryRouter><SignIn /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'An' } });
    fireEvent.change(screen.getByPlaceholderText('Phone or email'), { target: { value: '0902' } });
    fireEvent.click(screen.getByText('Continue →'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/me'));
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd client && npm test -- SignIn.test
```

Expected: FAIL

- [ ] **Step 3: Implement client/src/pages/SignIn.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { saveAuth } from '../lib/auth';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

export function SignIn() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.signIn({ name, contact, orgCode: orgCode || undefined });
      saveAuth(result);
      navigate(result.isOrganizer ? '/trip' : '/me');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 48 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--blue-bg)', border: '2.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'var(--blue-dark)', boxShadow: '2.5px 2.5px 0 var(--border)' }}>✶</div>
        <h1 style={{ fontSize: 28, margin: '8px 0 0' }}>Trip Splitter</h1>
        <p style={{ fontSize: 16, color: '#8a8a86', margin: 0, textAlign: 'center' }}>Sign in to split or check your share</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
        <Field label="Your name">
          <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Phone or email">
          <Input placeholder="Phone or email" value={contact} onChange={e => setContact(e.target.value)} required />
        </Field>
        <Field label="Organizer code (optional)">
          <Input placeholder="Organizer code (optional)" type="password" value={orgCode} onChange={e => setOrgCode(e.target.value)} />
        </Field>
        {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Continue →'}</Button>
      </form>

      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 9, padding: '7px 10px', fontSize: 13, lineHeight: 1.35, color: 'var(--yellow-text)', marginTop: 16 }}>
        One sign-in for everyone. Organizers enter the organizer code; everyone else just enters their name and contact.
      </div>
    </MobileShell>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd client && npm test -- SignIn.test
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/SignIn.tsx client/src/pages/SignIn.test.tsx
git commit -m "feat: SignIn page with organizer code + member routing"
```

---

## Task 9: CreateTrip Page

**Files:**
- Modify: `client/src/pages/CreateTrip.tsx`

- [ ] **Step 1: Implement client/src/pages/CreateTrip.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

interface MemberRow { name: string; contact: string; }

export function CreateTrip() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('₫');
  const [orgCode, setOrgCode] = useState('');
  const [members, setMembers] = useState<MemberRow[]>([{ name: '', contact: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addMember() {
    setMembers(m => [...m, { name: '', contact: '' }]);
  }

  function removeMember(i: number) {
    setMembers(m => m.filter((_, idx) => idx !== i));
  }

  function updateMember(i: number, field: keyof MemberRow, value: string) {
    setMembers(m => m.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createTrip({
        name: tripName,
        currency,
        orgCode,
        members: members.filter(m => m.name && m.contact),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      navigate('/trip');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <h2 style={{ fontSize: 26, margin: '24px 0 20px' }}>New trip</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Trip name">
          <Input placeholder="e.g. Da Lat Weekend" value={tripName} onChange={e => setTripName(e.target.value)} required />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Start date"><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></Field>
          <Field label="End date"><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></Field>
        </div>
        <Field label="Currency">
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100%', border: '2px solid #d3d2cc', borderRadius: 11, padding: '9px 12px', fontSize: 17, fontFamily: 'inherit', background: '#fff' }}>
            {['₫', '$', '€', '£'].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Organizer code">
          <Input type="password" placeholder="Set a secret code for organizer access" value={orgCode} onChange={e => setOrgCode(e.target.value)} required />
        </Field>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0 0' }}>Members</p>
        {members.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Field label="Name"><Input placeholder="Name" value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} /></Field>
            <Field label="Phone / email"><Input placeholder="Phone or email" value={m.contact} onChange={e => updateMember(i, 'contact', e.target.value)} /></Field>
            {members.length > 1 && <button type="button" onClick={() => removeMember(i)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#c8c7c1', marginBottom: 2 }}>×</button>}
          </div>
        ))}
        <button type="button" onClick={addMember} style={{ border: '2px dashed #bdbcb6', borderRadius: 10, padding: 8, textAlign: 'center', color: '#8a8a86', fontSize: 15, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add member</button>

        {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={loading} style={{ marginTop: 8 }}>{loading ? 'Creating…' : 'Start trip →'}</Button>
      </form>
    </MobileShell>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd client && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/CreateTrip.tsx
git commit -m "feat: CreateTrip page"
```

---

## Task 10: Dashboard Page

**Files:**
- Modify: `client/src/pages/Dashboard.tsx`

- [ ] **Step 1: Implement client/src/pages/Dashboard.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Activity, Trip } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

function formatAmount(amount: number, currency: string) {
  const s = Math.round(amount).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getTrip(), api.getActivities()])
      .then(([t, a]) => { setTrip(t); setActivities(a); })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  async function deleteActivity(id: number) {
    await api.deleteActivity(id);
    setActivities(a => a.filter(x => x.id !== id));
  }

  if (error) return <MobileShell><p style={{ color: 'red' }}>{error}</p></MobileShell>;
  if (!trip) return <MobileShell><p>Loading…</p></MobileShell>;

  const total = activities.reduce((s, a) => s + a.total_amount, 0);
  const memberCount = trip.members.length;

  return (
    <MobileShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 4px' }}>
        <h2 style={{ fontSize: 24, margin: 0 }}>{trip.name}</h2>
        <span style={{ background: 'var(--blue-bg)', border: '2px solid var(--blue)', color: 'var(--blue-dark)', borderRadius: 20, padding: '3px 11px', fontSize: 14 }}>
          {formatAmount(total, trip.currency)}
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '16px 0 8px' }}>Activities</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activities.map(a => (
          <Card key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 16 }}>{a.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {a.participants.length === memberCount ? 'Everyone' : a.participants.map(p => p.name).join(', ')} · {a.participants.length} people
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, whiteSpace: 'nowrap' }}>{formatAmount(a.total_amount, trip.currency)}</span>
              <button onClick={() => navigate(`/trip/activity/${a.id}/edit`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', fontSize: 14, fontFamily: 'inherit' }}>Edit</button>
              <button onClick={() => deleteActivity(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8c7c1', fontSize: 18 }}>×</button>
            </div>
          </Card>
        ))}

        <button onClick={() => navigate('/trip/activity/new')} style={{ border: '2.5px dashed var(--blue)', color: 'var(--blue-dark)', borderRadius: 13, padding: 11, textAlign: 'center', fontSize: 17, background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add activity</button>
      </div>

      <Button onClick={() => navigate('/trip/summary')} style={{ marginTop: 24 }}>View summary →</Button>
    </MobileShell>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd client && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Dashboard.tsx
git commit -m "feat: Dashboard page with activity list + delete"
```

---

## Task 11: AddActivity Page

**Files:**
- Modify: `client/src/pages/AddActivity.tsx`
- Create: `client/src/pages/AddActivity.test.tsx`

- [ ] **Step 1: Write failing test for chip + split logic**

Create `client/src/pages/AddActivity.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AddActivity } from './AddActivity';
import * as apiModule from '../api';
import type { Trip } from '../types';

const mockTrip: Trip = {
  id: 1, name: 'T', start_date: null, end_date: null, currency: '₫',
  members: [
    { id: 1, name: 'Nga', contact: 'nga', is_organizer: 1 },
    { id: 2, name: 'An', contact: 'an', is_organizer: 0 },
  ],
};

beforeEach(() => {
  vi.spyOn(apiModule.api, 'getTrip').mockResolvedValue(mockTrip);
  vi.spyOn(apiModule.api, 'createActivity').mockResolvedValue({ id: 99 });
});

describe('AddActivity', () => {
  it('shows live split calculation when chips are toggled', async () => {
    render(
      <MemoryRouter initialEntries={['/trip/activity/new']}>
        <Routes><Route path="/trip/activity/new" element={<AddActivity />} /></Routes>
      </MemoryRouter>
    );

    // Wait for members to load
    await screen.findByText('Nga');

    // Enter amount
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1200000' } });

    // Both selected by default → split 2 ways = 600,000 each
    expect(await screen.findByText(/600,000/)).toBeInTheDocument();

    // Deselect An → split 1 way = 1,200,000
    fireEvent.click(screen.getByText('An'));
    expect(screen.getByText(/1,200,000 ₫ each/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd client && npm test -- AddActivity.test
```

Expected: FAIL

- [ ] **Step 3: Implement client/src/pages/AddActivity.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Trip, Activity } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Field, Input } from '../components/Field';

function formatAmount(n: number, currency: string) {
  const s = Math.round(n).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function AddActivity() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getTrip().then(t => {
      setTrip(t);
      setSelected(new Set(t.members.map(m => m.id)));
      if (isEdit) {
        api.getActivities().then(acts => {
          const act = acts.find((a: Activity) => a.id === Number(id));
          if (act) {
            setName(act.name);
            setAmount(String(act.total_amount));
            setSelected(new Set(act.participants.map(p => p.id)));
          }
        });
      }
    });
  }, [id, isEdit]);

  function toggleMember(memberId: number) {
    setSelected(s => {
      const next = new Set(s);
      next.has(memberId) ? next.delete(memberId) : next.add(memberId);
      return next;
    });
  }

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const splitCount = selected.size;
  const splitText = splitCount > 0 && parsedAmount > 0
    ? `Split ${splitCount} ways · ${formatAmount(parsedAmount / splitCount, trip?.currency ?? '₫')} each`
    : splitCount === 0 ? 'Pick at least one person' : 'Enter an amount';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) { setError('Select at least one participant'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = { name, totalAmount: parsedAmount, memberIds: Array.from(selected) };
      if (isEdit) await api.updateActivity(Number(id), payload);
      else await api.createActivity(payload);
      navigate('/trip');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  if (!trip) return <MobileShell><p>Loading…</p></MobileShell>;

  return (
    <MobileShell>
      <h2 style={{ fontSize: 26, margin: '20px 0 20px' }}>{isEdit ? 'Edit activity' : 'Add activity'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="What was it?">
          <Input placeholder="e.g. Dinner — Night 1" value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Total amount">
          <Input placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" required />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Who joined?</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => setSelected(new Set(trip.members.map(m => m.id)))} style={{ border: '2px solid #d3d2cc', borderRadius: 8, padding: '3px 9px', fontSize: 13, color: '#6b6b67', cursor: 'pointer', background: '#fff', fontFamily: 'inherit' }}>Everyone</button>
            <button type="button" onClick={() => setSelected(new Set())} style={{ border: '2px solid #d3d2cc', borderRadius: 8, padding: '3px 9px', fontSize: 13, color: '#6b6b67', cursor: 'pointer', background: '#fff', fontFamily: 'inherit' }}>None</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {trip.members.map(m => (
            <Chip key={m.id} label={m.name} selected={selected.has(m.id)} onClick={() => toggleMember(m.id)} />
          ))}
        </div>

        <div style={{ border: '2px solid var(--blue)', background: 'var(--blue-bg)', borderRadius: 12, padding: 13, textAlign: 'center', fontSize: 18, color: 'var(--blue-dark)' }}>
          {splitText}
        </div>

        <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 9, padding: '7px 10px', fontSize: 13, lineHeight: 1.35, color: 'var(--yellow-text)' }}>
          Tap a name to include / exclude. The split recalculates instantly.
        </div>

        {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save activity'}</Button>
        <Button variant="outline" type="button" onClick={() => navigate('/trip')}>Cancel</Button>
      </form>
    </MobileShell>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd client && npm test -- AddActivity.test
```

Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/AddActivity.tsx client/src/pages/AddActivity.test.tsx
git commit -m "feat: AddActivity page with live split preview and edit support"
```

---

## Task 12: Summary Page

**Files:**
- Modify: `client/src/pages/Summary.tsx`

- [ ] **Step 1: Implement client/src/pages/Summary.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Summary as SummaryData, Trip } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';

function formatAmount(n: number, currency: string) {
  const s = Math.round(n).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function Summary() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getSummary(), api.getTrip()])
      .then(([s, t]) => { setSummary(s); setTrip(t); })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  function copyText() {
    if (!summary || !trip) return;
    const lines = [`${trip.name} — Summary`, ''];
    for (const m of summary.members) {
      lines.push(`${m.name}: ${formatAmount(m.total, trip.currency)}`);
      for (const a of m.activities) {
        lines.push(`  • ${a.name}: ${formatAmount(a.share, trip.currency)}`);
      }
    }
    navigator.clipboard.writeText(lines.join('\n'));
  }

  if (error) return <MobileShell><p style={{ color: 'red' }}>{error}</p></MobileShell>;
  if (!summary || !trip) return <MobileShell><p>Loading…</p></MobileShell>;

  const organieer = trip.members.find(m => m.is_organizer);
  const orgTotal = summary.members.find(m => m.id === organieer?.id)?.total ?? 0;

  return (
    <MobileShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 4px' }}>
        <h2 style={{ fontSize: 26, margin: 0 }}>Summary</h2>
        <span style={{ background: 'var(--blue-bg)', border: '2px solid var(--blue)', color: 'var(--blue-dark)', borderRadius: 20, padding: '3px 11px', fontSize: 14 }}>
          {formatAmount(summary.grandTotal, trip.currency)}
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '16px 0 8px' }}>Everyone owes {organieer?.name ?? 'organizer'}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {summary.members.filter(m => m.id !== organieer?.id).map(m => (
          <div key={m.id} style={{ border: '2px solid var(--border-light)', borderRadius: 12, background: 'var(--card-bg)', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px' }}>
              <span style={{ fontSize: 17 }}>{m.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 17, color: 'var(--blue-dark)' }}>{formatAmount(m.total, trip.currency)}</span>
                <span style={{ color: '#b6b5af', fontSize: 13 }}>{expanded === m.id ? '▴' : '▾'}</span>
              </span>
            </div>
            {expanded === m.id && (
              <div style={{ borderTop: '1.5px dashed #d8d7d1', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5, background: '#faf9f5' }}>
                {m.activities.map(a => (
                  <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b6b67' }}>
                    <span>{a.name}</span><span>{formatAmount(a.share, trip.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ border: '2px solid var(--blue)', borderRadius: 12, background: 'var(--blue-bg)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 16, color: 'var(--blue-dark)' }}>{organieer?.name} — paid everything</span>
          <span style={{ fontSize: 13, color: '#5b7bb5' }}>Paid {formatAmount(summary.grandTotal, trip.currency)} · gets back {formatAmount(summary.grandTotal - orgTotal, trip.currency)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <Button variant="outline" onClick={copyText}>⤴ Copy summary</Button>
        <Button variant="outline" onClick={() => navigate('/trip')}>← Back to activities</Button>
      </div>
    </MobileShell>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd client && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Summary.tsx
git commit -m "feat: Summary page with expandable per-person breakdown + copy to clipboard"
```

---

## Task 13: MyCosts Page

**Files:**
- Modify: `client/src/pages/MyCosts.tsx`

- [ ] **Step 1: Implement client/src/pages/MyCosts.tsx**

```tsx
import { useEffect, useState } from 'react';
import { api } from '../api';
import type { MyCosts as MyCostsData, Trip } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Card } from '../components/Card';
import { getAuth } from '../lib/auth';

function formatAmount(n: number, currency: string) {
  const s = Math.round(n).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function MyCosts() {
  const [data, setData] = useState<MyCostsData | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState('');

  const auth = getAuth();
  const memberId = auth?.memberId;

  useEffect(() => {
    Promise.all([api.getMyCosts(), api.getTrip()])
      .then(([d, t]) => { setData(d); setTrip(t); })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  if (error) return <MobileShell><p style={{ color: 'red' }}>{error}</p></MobileShell>;
  if (!data || !trip) return <MobileShell><p>Loading…</p></MobileShell>;

  const member = trip.members.find(m => m.id === memberId);
  const organizer = trip.members.find(m => m.is_organizer);

  return (
    <MobileShell>
      <h2 style={{ fontSize: 26, margin: '24px 0 16px' }}>Hi, {member?.name ?? 'there'}</h2>

      <div style={{ border: '2.5px solid var(--border)', borderRadius: 16, background: 'var(--blue-bg)', padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 14, color: '#5b7bb5' }}>You owe</span>
        <span style={{ fontSize: 40, color: 'var(--blue-dark)', lineHeight: 1.1 }}>{formatAmount(data.total, trip.currency)}</span>
        <span style={{ fontSize: 14, color: '#5b7bb5' }}>pay to {organizer?.name ?? 'organizer'}</span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '20px 0 8px' }}>Activities you joined</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.activities.map(a => (
          <Card key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>{a.name}</span>
            <span style={{ fontSize: 15, color: 'var(--blue-dark)' }}>{formatAmount(a.share, trip.currency)}</span>
          </Card>
        ))}
      </div>

      <p style={{ fontSize: 15, color: '#8a8a86', marginTop: 'auto', paddingTop: 24 }}>Pay {organizer?.name ?? 'the organizer'} back whenever you can 🙂</p>
    </MobileShell>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd client && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/MyCosts.tsx
git commit -m "feat: MyCosts page — member view of their own share"
```

---

## Task 14: Production Wiring + README

**Files:**
- Modify: `server/index.ts`
- Create: `README.md`

- [ ] **Step 1: Serve built client files from Express in production**

Update `server/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import tripRouter from './routes/trip.js';
import activitiesRouter from './routes/activities.js';
import summaryRouter from './routes/summary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trip', tripRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/api/summary', summaryRouter);

  if (process.env.NODE_ENV === 'production') {
    const staticDir = path.join(__dirname, '../../client/dist');
    app.use(express.static(staticDir));
    app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }

  return app;
}

const PORT = process.env.PORT ?? 3000;
const app = buildApp();
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
```

- [ ] **Step 2: Run all server tests one final time**

```bash
cd server && npm test
```

Expected: All PASS

- [ ] **Step 3: Full production build**

```bash
npm run build
NODE_ENV=production node server/index.ts
```

Open `http://localhost:3000` — should serve the React app.

- [ ] **Step 4: Commit**

```bash
git add server/index.ts
git commit -m "feat: serve React build from Express in production"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| F-01 Create trip | Task 4 + Task 9 |
| F-02 Add/edit/delete members | Task 4 (creation), Task 9 UI |
| F-03 One trip at a time | Task 4 (409 guard) |
| F-04 Add activity with name + amount | Task 5 + Task 11 |
| F-05 Select participants | Task 5 + Task 11 |
| F-06 Equal split | Task 6 (SQL) + Task 11 (live preview) |
| F-07 Edit/delete activity | Task 5 + Task 10 |
| F-08 Aggregate per-member total | Task 6 |
| F-09 Summary table | Task 12 |
| F-10 Share summary | Task 12 (copy to clipboard) |
| F-11 Simple member login | Task 3 + Task 8 |
| F-12 Members see only own costs | Task 6 `/summary/me` + Task 13 |
| F-13 Members see total owed | Task 13 |

All requirements covered. ✓
