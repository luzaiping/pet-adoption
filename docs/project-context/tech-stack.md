# Tech Stack & Conventions — Pet Adoption System

This mirrors the claude.ai Project Instructions content for this
project. Keep the two in sync when either changes.

## Pinned Versions
- Next.js 15.5.19
- Prisma 5.22.0 / @prisma/client 5.22.0
- NextAuth (Auth.js) 5.0.0-beta.31
- PostgreSQL 16 (Neon)
- bcryptjs 3.0.3
- zod 4.4.3

All versions are pinned exactly — no `^` ranges. Before adding any new
dependency or upgrading an existing one, search the web to confirm the
current actual latest version. Do not assume training-data versions
are still current; this ecosystem moves fast.

## Code Conventions
- All code, comments, and documentation: English.
- shadcn components → `components/ui/`; business components →
  `components/features/[domain]/`.
- Server Actions live in `actions/` (outside `app/`), split by
  business domain.
- Simple forms (login, register, application submission) →
  `useActionState` + Server Action, no React Hook Form. Complex
  forms (pet create/edit) → React Hook Form + Zod + shadcn `Form`.
- Next.js 15: `params` is a Promise — must `await` it.
- Paginated queries need a deterministic `orderBy` (e.g. `createdAt`
  + an `id` tiebreaker); reset `page` to 1 whenever a filter changes.

## Process Rules
- One task per turn. Wait for user verification before continuing —
  do not chain multiple implementation steps without confirmation.
- Suggest a commit message (Google-style, English) at logical
  checkpoints. Provide the message as text only — never run git
  commands without explicit confirmation.
- Whenever a new `.env` variable is introduced, remind the user to
  keep `.env.example` in sync (placeholder values only, never real
  secrets).