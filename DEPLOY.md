# Deploying to Vercel (with Postgres)

The app is a monorepo:

- **client/** – React + Vite SPA, built to `client/dist` (static, served by Vercel).
- **server/** – Express API, compiled to `server/dist`.
- **api/index.ts** – Vercel Serverless Function that wraps the Express app. All
  `/api/*` requests are rewritten to it (see `vercel.json`).

The database is **Postgres**. Locally and in tests it uses an in-process
Postgres (PGlite) so no external DB is needed; in production it uses the
connection string in the `POSTGRES_URL` environment variable.

## One-time setup

1. Install the Vercel CLI and log in:
   ```bash
   npm i -g vercel
   vercel login
   ```

2. From the repo root, link the project:
   ```bash
   vercel link
   ```

3. Create a Postgres database and attach it to the project:
   - In the Vercel dashboard → your project → **Storage** → **Create Database**
     → **Postgres** → connect it to the project.
   - Vercel automatically adds `POSTGRES_URL` (and related vars) to the
     project's environment. No code change needed.

## Deploy

```bash
vercel        # preview deployment
vercel --prod # production deployment
```

Vercel runs `npm run build` (builds the client and compiles the server), serves
`client/dist` as static files, and deploys `api/index.ts` as the API function.

On the first request the API creates its tables automatically
(`CREATE TABLE IF NOT EXISTS …`), so no separate migration step is required.

## Local development

```bash
npm install          # installs all workspaces
npm run dev          # client on :5173, server on :3000 (PGlite-backed)
```

Local data persists to `.pglite/` (git-ignored). Delete that folder to reset.

## Notes / follow-ups

- **Auth**: the API still trusts the `x-member-id` header (see the pre-go-live
  audit). Consider adding signed session tokens before opening this to the
  public.
- **Cold starts**: the serverless function migrates on first request; concurrent
  cold starts race harmlessly on `CREATE TABLE IF NOT EXISTS`.
