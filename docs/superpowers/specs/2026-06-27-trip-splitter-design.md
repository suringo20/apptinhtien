# Trip Expense Splitter — Design Spec

**Date:** 2026-06-27  
**Status:** Approved  
**Source:** BRD v1.0 + wireframes (Trip Splitter Wireframes.dc.html)

---

## 1. Overview

A mobile-optimized web app that lets Nga (the organizer) enter trip activities and select participants, then automatically splits costs equally. Team members log in to view only their own share. No Excel, no manual math.

---

## 2. Architecture

**Monorepo: React + Vite frontend / Express + SQLite backend**

```
trip-splitter/
├── client/               # React + Vite (dev: port 5173)
│   └── src/
│       ├── pages/        # SignIn, CreateTrip, Dashboard, AddActivity, Summary, MyCosts
│       ├── components/   # shared UI (Chip, Card, Button, etc.)
│       └── api.ts        # typed fetch wrapper for all API calls
├── server/               # Express + better-sqlite3 (port 3000)
│   ├── db.ts             # schema init + migrations
│   ├── routes/           # auth, trip, activities, summary
│   └── index.ts          # app entry point
└── package.json          # root: concurrently runs client + server in dev
```

- In **dev**: Vite proxies `/api/*` → `localhost:3000`
- In **production**: Express serves the built React files from `client/dist/` and handles API on the same port 3000

---

## 3. Data Model (SQLite)

```sql
CREATE TABLE trips (
  id             INTEGER PRIMARY KEY,
  name           TEXT NOT NULL,
  start_date     TEXT,
  end_date       TEXT,
  currency       TEXT NOT NULL DEFAULT '₫',
  organizer_code TEXT NOT NULL,  -- bcrypt hash
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE members (
  id           INTEGER PRIMARY KEY,
  trip_id      INTEGER NOT NULL REFERENCES trips(id),
  name         TEXT NOT NULL,
  contact      TEXT NOT NULL,   -- phone or email (unique per trip)
  is_organizer INTEGER DEFAULT 0
);

CREATE TABLE activities (
  id           INTEGER PRIMARY KEY,
  trip_id      INTEGER NOT NULL REFERENCES trips(id),
  name         TEXT NOT NULL,
  total_amount REAL NOT NULL
);

CREATE TABLE activity_members (
  activity_id  INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  member_id    INTEGER NOT NULL REFERENCES members(id),
  PRIMARY KEY (activity_id, member_id)
);
```

Cost splitting is computed at query time: `total_amount / COUNT(participants)` — no stored owe column.

Only one active trip exists at a time (enforced server-side: POST /api/trip fails if a trip already exists).

---

## 4. Auth Flow

Simple, no JWT/sessions — stateless on the server:

1. Everyone uses the same `/` sign-in screen: name + phone/email + optional organizer code
2. Server matches `contact` against `members` in the current trip
3. If organizer code provided and bcrypt matches → `isOrganizer: true`
4. Result stored in `localStorage`: `{ memberId, isOrganizer, tripId }`
5. Route guards read localStorage and redirect appropriately

Organizer code is set at trip creation time; stored as a bcrypt hash in `trips.organizer_code`.

---

## 5. API Routes

```
POST /api/auth/signin              # { name, contact, orgCode? } → { memberId, isOrganizer }

GET  /api/trip                     # current trip + members list
POST /api/trip                     # create trip { name, dates, currency, members[], orgCode }

GET  /api/activities               # all activities with participant lists
POST /api/activities               # add activity { name, totalAmount, memberIds[] }
PUT  /api/activities/:id           # edit activity
DELETE /api/activities/:id         # delete activity

GET  /api/summary                  # per-member totals + breakdown (organizer only)
GET  /api/summary/me               # my costs + activity list (member, identified by memberId header)
```

---

## 6. Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/` | SignIn | Everyone |
| `/trip/new` | CreateTrip | Organizer (no trip exists) |
| `/trip` | Dashboard | Organizer |
| `/trip/activity/new` | AddActivity | Organizer |
| `/trip/activity/:id/edit` | AddActivity | Organizer |
| `/trip/summary` | Summary | Organizer |
| `/me` | MyCosts | Members |

### Key interactions
- **AddActivity**: chip toggling is pure local state; split amount recalculates instantly in-browser. API call only on Save.
- **Summary**: each person row is expandable accordion showing per-activity breakdown.
- **MyCosts**: read-only; shows hero total + itemized activity list.
- **Share summary**: copies a plain-text summary to clipboard (F-10 Should Have).

### Design system (matches wireframes)
- Font: `Patrick Hand` (Google Fonts)
- Background: `#ecebe7`
- Primary blue: `#4a73c4` / dark blue: `#2b56a0`
- Cards: white `#fdfdfb`, border `2px solid #2b2b2b`, box-shadow offset `6px 7px`
- Chips selected: `#4a73c4` filled; unselected: white with dashed border `#bdbcb6`
- Annotation yellow: `#fdf3c7` / `#ddca73`

---

## 7. Non-Functional

| Concern | Decision |
|---|---|
| Mobile-first | All pages max-width ~390px, touch-friendly tap targets |
| Performance | Split calc is in-browser (instant); API responses are small |
| Security | memberId sent in request header; server validates ownership before returning data |
| Hosting | Single Node.js process on Railway / Render / VPS; SQLite file on persistent disk |

---

## 8. Out of Scope (v1)

- Custom split ratios
- Multiple concurrent trips / trip history
- Payment integration
- Member-to-member messaging
- Multiple payers
