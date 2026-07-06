# PetAdopt

A production-deployed, full-stack pet adoption platform for browsing adoptable animals, managing adoption applications, and operating shelter workflows through a role-based administration dashboard.

**Live demo:** [pet-adoption-eight-mu.vercel.app](https://pet-adoption-eight-mu.vercel.app/)

The public demo provides **Try as Adopter** and **Try as Admin** controls, so both workflows can be evaluated without entering credentials.

## Core Features

### Public experience

- Responsive landing page with live adoption statistics and featured pets
- Server-rendered pet catalog with species filters and deterministic pagination
- Detailed pet profiles with shelter information and adoption status
- Authentication-aware adoption flow with optional applicant messages
- Loading skeletons, empty states, toast feedback, and a global error boundary

### Adopter dashboard

- Complete application history across pending, approved, rejected, and withdrawn states
- Application details, pet links, submission dates, and applicant messages
- Withdrawal support for pending applications
- Responsive card-based layout for desktop and mobile devices

### Administration dashboard

- Role-protected overview, application queue, and pet management routes
- Applications grouped by pet with applicant and message details
- Optimistic approve/reject interactions with rollback and user feedback
- Searchable, filterable, sortable, and paginated pet management
- Shared create/edit form with server-validated fields and image selection
- Dedicated table and card layouts for desktop and mobile screens

## Business Rules and Data Integrity

The adoption workflow supports multiple concurrent applications for the same available pet while limiting each adopter to one active application per pet.

Approving an application executes the following changes in a single database transaction:

1. The selected application becomes `APPROVED`.
2. Other pending applications for the same pet become `REJECTED`.
3. The pet becomes `ADOPTED`.

Rejecting one application does not affect the pet or competing applications. Withdrawn applications remain in the applicant's history and do not prevent a later application.

## Architecture

### Server-first rendering

Public pages and initial dashboard data are rendered with Next.js Server Components. Database access is kept in server-only data modules, while interactive dashboard mutations use focused Client Components.

### Authentication and authorization

Auth.js uses credentials authentication with encrypted JWT sessions. Administrative access is protected at three independent layers:

1. Middleware rejects unauthorized dashboard requests.
2. The admin layout verifies the session role before rendering protected routes.
3. Every administrative Server Action revalidates the current user and role against the database.

The database check also rejects stale sessions after demo data is reset or an account's role changes.

### Form and mutation strategy

- Simple actions use `useActionState` with Server Actions.
- Complex pet forms use React Hook Form with shared Zod schemas.
- Administrative mutations use TanStack Query for optimistic updates and rollback.
- Server Actions perform their own authentication and validation rather than relying on middleware alone.

### Query design

- Public filters and administrative filters are URL-driven and shareable.
- Filter changes reset pagination to the first page.
- Paginated queries use deterministic secondary ordering to prevent duplicate or missing rows.
- Homepage database sections stream independently through component-level Suspense boundaries.

### Demo environment

The production demo uses fixed role-switching accounts and seeded data. A protected Vercel Cron route resets and reseeds the Neon database daily, keeping the public environment predictable without exposing the reset endpoint.

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15.5.19, React 19.2.4, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Base UI, Radix UI |
| Database | PostgreSQL 16 on Neon |
| ORM | Prisma 5.22.0 |
| Authentication | Auth.js 5 beta, bcryptjs 3.0.3 |
| Validation | Zod 4.4.3 |
| Forms | React Hook Form 7, `useActionState` |
| Client mutations | TanStack Query 5 |
| Deployment | Vercel with scheduled database reset |

## Data Model

The application uses five primary models:

- `User` — credentials, profile details, and role
- `Shelter` — contact details and associated pets
- `Pet` — profile, shelter, availability, and images
- `PetImage` — pet image metadata and primary-image designation
- `AdoptionApplication` — applicant, pet, reviewer, message, and review state

Reviewer deletion preserves historical applications by setting `reviewerId` to `null`. Shelter deletion cascades through pets, images, and applications, which keeps database resets consistent.

## Local Development

### Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL 16, or a Neon PostgreSQL project

### Installation

```bash
git clone <repository-url>
cd pet-adoption
npm install
cp .env.example .env
```

Configure the environment variables described below, then initialize the database:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled PostgreSQL connection used by the application |
| `DIRECT_URL` | Direct PostgreSQL connection used by Prisma migrations and seeding |
| `AUTH_SECRET` | Secret used to sign and encrypt Auth.js session tokens |
| `IS_DEMO` | Enables protected public-demo behavior and role switching |
| `CRON_SECRET` | Bearer token protecting the scheduled reset endpoint |

Generate an authentication secret with:

```bash
openssl rand -base64 32
```

Never commit real environment values. `.env.example` contains placeholders only.

## Available Commands

```bash
npm run dev      # Start the development server
npm run lint     # Run ESLint
npm run build    # Generate Prisma Client and create a production build
npm run start    # Start the production server
```

Database utilities:

```bash
npx prisma migrate deploy
npx prisma db seed
npx prisma studio
```

## Deployment

The application is continuously deployed to Vercel from the production branch. Runtime database traffic uses Neon's pooled connection, while Prisma migrations and seeding use a separate direct connection. The production build regenerates Prisma Client before running `next build` to prevent stale generated clients from dependency caching.
