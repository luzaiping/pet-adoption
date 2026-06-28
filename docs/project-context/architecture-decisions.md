# Architecture Decisions — Pet Adoption System

## Confirmed Decisions

### 1. Tech stack version locking
Locked to Next.js 15.5.19 (not 16.x — latest 15.x line still receiving
backported security patches), Prisma 5.22.0 (not 6.x/7.x, even though
7.x is the ecosystem's actual latest), NextAuth(Auth.js) 5.0.0-beta.31,
PostgreSQL 16 (Neon), bcryptjs 3.0.3, zod 4.4.3. Why: the project
targets a deliberately older, stable toolchain matching the original
design doc's intended era, rather than chasing latest majors (Next 16,
Prisma 7, Postgres 18 all exist but were rejected — see Rejected
Approaches; Prisma 5.x predates Postgres 18 entirely, so pairing them
would be an untested combination). Reason is internal consistency, not
unfamiliarity with newer versions.

zod 4.4.3 was introduced ahead of the original schedule (planned as a
later step, pulled forward into the register feature) because
register's validation complexity already justified it. v4 API: use
top-level `z.email()`, not the deprecated `z.string().email()`.

### 2. Database host: Neon over Supabase
Neon auto-suspends compute after ~5 min idle and auto-resumes on the
next request within milliseconds. Supabase free tier pauses after 7
days of inactivity and requires a manual "Restore" click in the
dashboard (and after 90 days, manual backup migration). For a
long-lived, low-traffic portfolio demo, Neon needs zero maintenance.

### 3. Data model & RBAC
Five models: User / Shelter / Pet / PetImage / AdoptionApplication.
RBAC is a single `role` enum on `User` (`USER`/`STAFF`/`ADMIN`) — no
separate permissions table, since fine-grained permission matrices
aren't required. `AdoptionApplication` has two distinct relations to
`User`: `applicant` (`onDelete: Cascade`) and `reviewer` (optional,
`onDelete: SetNull`) — distinguished via Prisma relation names
(`@relation("ApplicantApplications", ...)` /
`@relation("ReviewerApplications", ...)`) since both point at the same
table. Cascade flows Shelter→Pet→PetImage/Applications so the daily
demo reset doesn't need to delete tables in manually-ordered steps.
Deleting a User does NOT cascade-delete applications they reviewed —
only sets `reviewerId` to null — so review history survives a removed
staff account. `Pet.species` is a plain `String`, not an enum — leaves
room to add species without a migration. `ActivityLog` was cut from
scope (first item on the "cut if behind schedule" list).

### 4. Pet images: local static files, not real uploads
20–30 cat/dog photos (4:3, ~1200px long edge, <300KB each, sourced
from Pexels/Unsplash) committed directly into `/public/pets/`, named
`dog-01.jpg`...`dog-15.jpg` / `cat-01.jpg`...`cat-15.jpg`. The admin
"upload" UI will actually be a picker over this fixed pool, not a real
upload pipeline. `PetImage.url` stores the relative path.

### 5. Demo Mode
Plan: an `assertNotDemoMode()` helper called at the top of every
write-path Server Action, gated by an `IS_DEMO` env var, throwing a
friendly error if true. A daily Vercel Cron job (timed for US/EU
nighttime, lowest traffic) calls `resetAndSeedDatabase()` to wipe and
reseed. Tradeoff to document in the README: if an admin generates an
AI pet bio shortly before the nightly reset, it will be reverted —
expected behavior, not a bug.

Status: partially implemented. `IS_DEMO` env var now exists; first
real use is gating `registerAction`. Daily Cron reset and
`assertNotDemoMode()` for other write paths are still pending.

### 6. Seed script split: reusable function vs. CLI entry point
`src/lib/seed-data.ts` exports a pure `resetAndSeedDatabase()` function
that does NOT call `$disconnect()` — it doesn't own the Prisma
connection lifecycle, because the future Vercel Cron API route will
import and call this same function from within a long-lived Next.js
process, where disconnecting the shared singleton would break the
app. `prisma/seed.ts` is a thin CLI wrapper (used by `npx prisma db
seed`) that calls the function and THEN disconnects, since it's a
one-off process that should exit cleanly. This split exists
specifically so the seeding logic has exactly one implementation,
reused by both the CLI and the future Cron route.

### 7. Auth: NextAuth v5, Credentials + JWT, no Prisma adapter (3-layer RBAC defense)
No `@auth/prisma-adapter` — pure Credentials+JWT needs none (the
adapter only matters for OAuth's Account/Session/VerificationToken
tables). If Google OAuth is ever added, the adapter + those tables get
added together as one combined task, not piecemeal.

Config is split into `auth.config.ts` (edge-safe: providers array
empty, `authorized`/`jwt`/`session` callbacks, no Prisma import — can
run in Edge middleware) and `auth.ts` (full config: Credentials
provider with a manual `prisma.user.findUnique` + `bcrypt.compare`,
session strategy `jwt`) — keeps Node-only deps out of the
edge-compatible code path. The `authorize()` callback's return object
deliberately excludes the password hash field before it flows into
the `jwt` callback and gets encoded into the token.

`middleware.ts` exports `NextAuth(authConfig).auth` directly, NOT
wrapped in a custom function — preserves the documented, unambiguous
behavior of the `authorized()` callback (see Rejected Approaches).
`authorized()` does double duty: (a) login-required gate for
`/dashboard/*` (returns `false` → redirect to `pages.signIn`), (b)
role gate for `/dashboard/admin/*` (returns
`NextResponse.redirect('/dashboard/forbidden')` when role isn't
ADMIN). `matcher: ['/dashboard/:path*']` only — public/auth pages are
NOT covered by middleware, and middleware keeps doing a JWT-only check
with no DB call.

`/dashboard/forbidden` is deliberately outside `/dashboard/admin/*` to
avoid an infinite redirect loop (per NextAuth's own warning on this).
Do not move it under `/admin/` later. Already-logged-in users visiting
`/login` or `/register` are redirected via a page-level `await auth()`
+ `redirect()` check inside the Server Component — not via middleware
(matcher doesn't cover those paths).

Defense-in-depth plan, 3 layers (only layer 1 built so far): layer 1 =
middleware `authorized()` callback (built); layer 2 = role check in
`(dashboard)/dashboard/admin/layout.tsx` (not yet built); layer 3 =
`assertAdmin()` helper called inside every admin Server Action, same
pattern as the planned `assertNotDemoMode()` (not yet built — deferred
until an actual admin Server Action exists to attach them to).

### 8. Directory/file conventions
- Route groups: `(public)` / `(auth)` / `(dashboard)` for physical
  permission-boundary separation — route groups don't appear in the
  URL, so any route group containing a page meant to live at a nested
  path (e.g. `/dashboard`) needs a real nested segment inside it.
- `actions/` lives outside `app/`, split by business domain.
- `schemas/` is the single Zod validation source shared by React Hook
  Form and Server Actions; now contains `schemas/auth.ts` (register
  validation).
- shadcn components stay untouched in `components/ui/`; business
  components go in `components/features/[domain]/`.
- `providers/query-provider.tsx` (not yet created) will wrap only
  `(dashboard)/layout.tsx`, keeping public pages pure Server Components.

### 9. Form strategy
Simple forms (login, register, submit application) use native
`useActionState` + Server Action — no React Hook Form. Complex forms
(pet create/edit) will use React Hook Form + Zod + shadcn `Form`.
Public pet filtering uses URL `searchParams` + Server Component
(SEO-friendly, shareable links). Admin mutations will use TanStack
Query `useMutation` wrapping a Server Action for optimistic updates.
No Zustand — not needed given the Server-Component-heavy architecture.

On register's validation failure, only the `email` field is echoed
back into the form; `password`/`confirmPassword` are never echoed
(see Rejected Approaches).

### 10. Public pet browsing
Query logic is centralized in `src/lib/pets.ts` (`getPets()`,
`getPetById()`) instead of inline in `page.tsx` — anticipates reuse by
the future admin pets page. All three pet statuses
(Available/Pending/Adopted) are shown publicly, color-coded via a
shared `StatusBadge` — chosen over Available-only, for a more
transparent/"alive" feel. Pagination is offset-based (`skip`/`take`),
12/page — chosen over cursor-based pagination since 30 records doesn't
justify the added complexity; it requires a deterministic `orderBy`
(e.g. `createdAt` + `id` tiebreaker), without which pages can show
duplicate or missing items. Changing the species filter resets `page`
to 1 — otherwise switching categories can land on an out-of-range,
blank page. `pagination.tsx` and `status-badge.tsx` were built as
generic, reusable components, not pets-specific — anticipating reuse
by the admin pets page. No "similar pets" section on the detail page —
kept deliberately simple. `loading.tsx` was added on both `/pets` and
`/pets/[id]` (Suspense-based skeletons) — targets the documented Neon
cold-start delay; also fires briefly on pagination/filter changes, not
just first load.

### 11. Design system tokens
Primary color: deep pine green (`#3A6B53`, computed precisely to
OKLCH via a manual sRGB→OKLab→OKLCH script — not estimated). Warm
off-white background, warm clay accent (`#D97A3E`) used sparingly
(e.g. demo-mode badges), not as a primary CTA color. Headings: Fraunces
(serif). Body/UI: Plus Jakarta Sans. Implemented via two separate
`next/font` CSS variables (`--font-sans`, `--font-heading`) rather
than aliasing one to the other (the shadcn default template ships
with `--font-heading: var(--font-sans)`, which was changed). Only
light mode (`:root`) was customized; `.dark` and sidebar/chart tokens
were deliberately left at shadcn defaults since dark mode and the
sidebar component aren't being built yet.

### 12. Neon connection strings
Two URLs: `DATABASE_URL` (pooled, `-pooler` in hostname, used at
runtime) and `DIRECT_URL` (unpooled, used by `prisma migrate`/`db
seed`) — required regardless of Prisma minor version, because Neon's
connection pooling uses PgBouncer transaction mode, which breaks the
prepared statements that schema-changing migration commands need.
`DIRECT_URL` has `&connect_timeout=15` appended to tolerate Neon's
cold-start delay (TCP connects instantly; the Postgres handshake after
an idle period can take longer than Prisma's default timeout).

### 13. Git branching
`main` stays releasable; all current work happens on
`feature/upwork-demo`. Future iterations (new tech stacks, new
features) get their own `feature/*` branches off `main`.

## Rejected / Removed Approaches

- **`@auth/prisma-adapter`**: installed, then uninstalled. Only needed
  for OAuth (Account/Session/VerificationToken tables); Credentials+JWT
  needs no adapter. Will be reintroduced as a single combined task
  alongside Google OAuth tables if that feature is ever added — not
  added piecemeal now.
- **Better Auth instead of NextAuth v5**: considered after discovering
  Auth.js/NextAuth was acquired by the Better Auth team and put into
  maintenance-only mode (security patches only) in early 2026, with
  Better Auth's own docs recommending it for new projects. Developer
  explicitly chose to stay on NextAuth v5 anyway, accepting the
  "legacy choice" tradeoff to avoid the API-redesign learning cost.
- **Next.js 16.x / Prisma 6.x–7.x / Postgres 18**: all are the actual
  current latest at time of writing, but rejected in favor of older
  versions matching the original design doc's intended toolchain era.
- **shadcn `form` component + React Hook Form for the login page**:
  skipped — login is a "simple form" per the form-strategy decision
  (#9), so it uses plain `Input`/`Label`/`Button` + native
  `useActionState`, not the RHF-based `Form` component.
- **`@types/bcryptjs`**: not installed — `bcryptjs` 3.x ships its own
  TypeScript types; adding the old `@types` package would be redundant
  and could conflict.
- **`(dashboard)/page.tsx` at the route group root**: initially created
  directly under `(dashboard)/`, which collided with `(public)/page.tsx`
  — both resolved to `/` since route groups are invisible in the URL.
  Fixed by nesting a real `dashboard/` segment inside the route group.
- **Neon's auto-generated Prisma snippet comment** ("uncomment
  `directUrl` only if Prisma < 5.10"): not trusted/followed — current
  Neon docs recommend keeping `directUrl` regardless of Prisma minor
  version, since the underlying PgBouncer transaction-mode issue isn't
  version-dependent.
- **Custom-wrapped middleware function** (`auth((req) => {...})` with
  hand-written logic inside): rejected in favor of extending the
  `authorized()` callback to return a `NextResponse` directly. There
  are open, unresolved reports in the NextAuth v5 repo about whether
  `authorized()` still fires once `auth()` is wrapped this way;
  extending `authorized()` itself is officially documented and
  unambiguous.
- **Node.js middleware runtime** (`runtime: 'nodejs'`, stable as of
  Next.js 15.5.x): considered, not adopted. Middleware keeps doing a
  JWT-only check with no DB call, per the recommendation against
  querying the database inside middleware.
- **Redirect to `/dashboard` + query-param-driven toast** for the
  "access denied" UX: rejected in favor of a dedicated
  `/dashboard/forbidden` page. Avoids needing a toast library, avoids
  query-param read/clear timing issues, gives one reusable redirect
  target for future layers.
- **Cursor-based pagination** for `/pets`: rejected in favor of offset
  (`skip`/`take`); 30 records doesn't justify the complexity.
- **Echoing password/confirmPassword back into the form** on
  validation failure: rejected; only `email` is echoed back.
- **Redirecting already-logged-in users away from `/login` and
  `/register` via middleware**: first attempt tried this, but the
  `matcher` only covers `/dashboard/:path*`, so the added logic never
  actually ran (silent dead code). Caught before merging; replaced
  with a page-level `await auth()` + `redirect()` check inside each
  page.