# RLJIT CSE Algorithmic Challenge Platform

Phase 1 of 9. See `docs/ARCHITECTURE.md` for the full system design,
database schema, API spec, and UI page map — that document is the
reference for every later phase.

## What Phase 1 delivers

- Project scaffold: Next.js 15 (App Router) + React 18 + TypeScript +
  Tailwind CSS, configured with a navy/gold/white theme.
- Full PostgreSQL schema for every table listed in the brief (`prisma/schema.prisma`),
  with relationships, indexes, and the documented ranking tie-break rule.
- Role-based authentication:
  - `POST /api/auth/student/login` (USN + password)
  - `POST /api/auth/admin/login` (email + password)
  - `POST /api/auth/logout`
  - Passwords hashed with bcrypt (never stored or logged in plaintext).
  - JWT session in an httpOnly, Secure, SameSite=strict cookie.
  - `middleware.ts` blocks `/admin/*` and `/student/*` (pages and API) by
    role, in addition to per-handler checks.
  - Rate limiting on both login endpoints (5 attempts/min/IP).
  - Audit log entries written on every login.
- Landing page (role picker), student login page, admin login page, and
  placeholder dashboards that confirm the session round-trips correctly
  (full dashboards are built in Phases 2 and 4).
- Seed script that creates one admin and one sample student for local
  testing.

## Why Next.js 15, not 14

The brief didn't pin a minor version. Next.js 14 reached end-of-life on
26 Oct 2025 and will not receive further CVE patches; several 2025
advisories (middleware auth bypass, SSRF, RSC deserialization DoS) hit the
14.x line. This project targets Next.js `15.5.9`, the current patched
release, so it stays on a maintained branch. The only code-level
consequence is that `cookies()`/`headers()` from `next/headers` are async
in Next 15 — already accounted for in `src/lib/auth.ts`.

## Setup

Requires Node.js 20+ and a running PostgreSQL instance.

```bash
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres instance, and JWT_SECRET
# to a strong random value (openssl rand -base64 48)

npm install
npx prisma migrate dev --name init   # creates all tables
npm run prisma:seed                  # creates admin@rljit.edu / 1RJ23CS001
npm run dev                          # http://localhost:3000
```

Default seeded credentials (change immediately in any shared environment):

| Role | Identifier | Password |
|---|---|---|
| Admin | `admin@rljit.edu` | `ChangeMe@123` |
| Student | USN `1RJ23CS001` | `Student@123` |

## Errors checked / known sandbox limitation

- `npm install` — clean, no vulnerability warnings on Next 15.5.9.
- `npx tsc --noEmit` — zero errors once `npx prisma generate` has run.
  In the environment this was built in, outbound network is restricted
  and can't reach `binaries.prisma.sh`, so the Prisma client couldn't be
  generated here; the one resulting TS error (`Role` not exported from
  `@prisma/client`) disappears the moment `prisma generate` runs
  somewhere with normal internet access (any local machine or CI). This
  is a sandbox artifact, not a bug in the schema or code.
- All other application code (auth routes, middleware, pages, lib
  helpers) type-checks cleanly.

## Manual test cases for this phase

1. **Admin login success** — POST `/api/auth/admin/login` with the seeded
   admin credentials → `200`, session cookie set, redirect to
   `/admin/dashboard` shows the admin's name and department.
2. **Admin login failure** — wrong password → `401`, generic
   "Invalid email or password" (does not reveal whether the email exists).
3. **Student login success** — POST `/api/auth/student/login` with seeded
   USN/password → `200`, redirect to `/student/dashboard` shows USN,
   name, semester, section.
4. **Cross-role access blocked** — log in as a student, then request
   `/admin/dashboard` directly → redirected to `/admin/login`
   (middleware blocks by role before the page renders).
5. **Unauthenticated API access** — call any `/api/*` route without a
   session cookie (other than the public auth routes) → `401`.
6. **Rate limiting** — 6 rapid login attempts from the same IP within a
   minute → the 6th returns `429` with a `Retry-After` header.
7. **Inactive account** — set a seeded user's `isActive` to `false` in
   the DB, attempt login → `401`, same generic message as a wrong
   password (no account-status leak).
8. **Logout** — `POST /api/auth/logout` clears the cookie; a subsequent
   request to a protected page redirects to login again.

## What remains

- Phase 2 — Admin dashboard stat cards + full event management (create,
  edit, publish, access-code generation).
- Phase 3 — Question management (MCQ/multi-select/numerical/coding, test
  cases, CSV import).
- Phase 4 — Student test interface (timer, navigation, autosave, Monaco
  editor wiring).
- Phase 5 — Isolated code-execution/judge service.
- Phase 6 — Tab-switch / fullscreen / copy-paste monitoring.
- Phase 7 — Live monitoring screen (SSE).
- Phase 8 — Results, ranking, leaderboard, CSV/XLSX/PDF export.
- Phase 9 — Security hardening pass + UI polish.
