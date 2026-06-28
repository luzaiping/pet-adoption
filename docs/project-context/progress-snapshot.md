# Progress Snapshot — Pet Adoption System
(Reflects current state, not a chronological log)

## Completed

### Infrastructure
- Next.js 15.5.19 scaffolded, git branch `feature/upwork-demo`
- Prisma 5.22.0 + schema.prisma (5 models, 4 enums), Neon Postgres
  16, initial migration applied
- `src/lib/prisma.ts` singleton (HMR-safe), connectivity verified
- `seed-data.ts` / `prisma/seed.ts` — seeded 5 users (2 demo
  accounts + 3 filler applicants), 3 shelters, 30 pets (15 dog /
  15 cat, ~60/20/20% available/pending/adopted), 16 adoption
  applications
- Route groups `(public)/(auth)/(dashboard)` scaffolded (route
  group/URL collision bug found and fixed early on)
- shadcn/ui initialized, OKLCH design tokens, Fraunces (heading) +
  Plus Jakarta Sans (body)

### Auth & Authorization
- NextAuth v5 wired: `auth.config.ts` (edge-safe) + `auth.ts`
  (full, Credentials provider, bcrypt), no PrismaAdapter
- `/login` page — `LoginForm` + `loginAction`, `signIn()` +
  `AuthError` pattern — verified (success + failure paths)
- `middleware.ts` — protects `/dashboard/:path*`, verified
  (unauthenticated → `/login`)
- Role-based admin gating — `authorized()` callback extended to
  redirect non-admin users away from `/dashboard/admin/*` to
  `/dashboard/forbidden` — verified with both demo accounts
- `/dashboard/forbidden` page (shadcn Alert + Button)
- `/register` page — Zod-validated (`schemas/auth.ts`,
  `registerSchema`), `registerAction` (uniqueness check, bcrypt
  hash, auto sign-in, confirm-password field, no password
  echo-back on error), gated behind `IS_DEMO` — verified including
  the demo-mode block
- Already-logged-in users visiting `/login`/`/register` are
  redirected to `/dashboard` via a page-level `auth()` check

### Public Pet Browsing
- `src/lib/pets.ts` — `getPets()` (filter by species, offset
  pagination, deterministic `orderBy`) and `getPetById()` (includes
  images + shelter)
- `/pets` list page (ChatGPT-implemented) — all statuses shown via
  `StatusBadge`, species filter resets page to 1, 12/page pagination
  — functionally verified, but flagged by the developer as lower
  implementation quality than other pages; may be worth a review
  pass later
- `/pets/[id]` detail page (Claude-implemented, after taking over
  from ChatGPT) — `await params`, `notFound()` + custom
  `not-found.tsx` for missing pets, image gallery, species/breed/
  age/gender/description, shelter info — verified, except the
  secondary-thumbnails code path is untested (current seed data only
  has primary images per pet)
- `loading.tsx` on both `/pets` and `/pets/[id]` (Suspense
  skeletons, targets Neon cold-start delay) — verified to also fire
  on pagination/filter changes
- Shared components: `pet-card.tsx`, `pet-filters.tsx`,
  `pagination.tsx`, `status-badge.tsx` — last two built generic,
  intended for reuse by the future admin pets page

## Known Issues / Watch Items
- `/pets` list page quality flagged as mediocre by the developer —
  not broken, but a candidate for a closer review pass later
- Detail page's multi-image thumbnail row has never been exercised
  against real data — current seed only assigns one (primary) image
  per pet; consider seeding at least one pet with multiple images
- `/login` still uses hand-written validation, not Zod — `/register`
  and `/login` are now inconsistent; low-priority cleanup

## Next Steps (discussed, not yet started)
1. Adoption application submission flow — in scoping; open
   questions not yet resolved: can multiple users apply to the same
   pet concurrently, can the same user re-apply to a pet they
   already applied to, where to redirect after a successful
   submission
2. Admin review queue (needs TanStack Query — not yet installed)
3. `assertAdmin()` helper — to be written alongside the first real
   admin Server Action (layer 3 of the RBAC defense plan)
4. `assertNotDemoMode()` helper + remaining Demo Mode write-blocking
5. Vercel Cron route calling `resetAndSeedDatabase()`
6. AI pet-bio generation via DeepSeek API (rate-limited)
7. Final homepage design pass (hero, live stats, featured pets,
   demo entry section) — deliberately deferred
8. Complex forms (pet create/edit) via React Hook Form + Zod +
   shadcn `Form`
9. Vitest + Testing Library setup
10. README "Design Decisions" section, demo video, screenshots
11. Mobile responsive pass
12. Vercel deployment