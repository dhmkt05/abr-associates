# ABR Associates Admin Dashboard

Private internal business management system for ABR Associates, built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase Auth/database.

## Features

- Admin login with Supabase Auth
- Protected dashboard pages for authenticated users only
- Dashboard overview with business KPIs and recent activity
- Role-based access control for `admin`, `data_team`, `sales_team`, and `documentation_team`
- Helper database with add, edit, delete, and search
- Sales pipeline for employers and helper matching
- Documentation tracker for post-confirmation stages
- Finance tracker with automatic profit calculation
- Admin activity logs for key changes across helpers, deals, documentation, and finance
- Reports and settings pages
- Ready to deploy on Vercel

## Tech stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Supabase (`@supabase/supabase-js` + `@supabase/ssr`)
- Vercel-compatible project structure

## Project structure

```text
app/
  (auth)/login/
  (dashboard)/
    dashboard/
    helpers/
    sales/
    documentation/
    finance/
    reports/
    settings/
components/
  auth/
  dashboard/
  documentation/
  finance/
  helpers/
  layout/
  ui/
lib/
  supabase/
  actions.ts
  data.ts
  demo-data.ts
  env.ts
  types.ts
  utils.ts
supabase/
  rbac.sql
  schema.sql
  seed.sql
proxy.ts
```

## Environment variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The app already reads the existing Supabase project from `.env.local`.

## Supabase setup

1. Open your Supabase SQL editor.
2. Run `supabase/schema.sql` if you need to recreate the tables/policies.
3. Run `supabase/rbac.sql` to create `profiles`, `activity_logs`, and their RLS policies.
4. Run `supabase/seed.sql` if you want example records.
5. In Supabase Auth, create each user manually.
6. Insert one row into `profiles` for each auth user using the UUID from `auth.users`.
7. Confirm RLS policies allow authenticated users to read and write the business tables, and admins to manage profiles/activity logs.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Authentication behavior

- `/login` is the public route
- `/dashboard`, `/helpers`, `/sales`, `/documentation`, `/finance`, `/reports`, and `/settings` require authentication
- Unauthenticated users are redirected to `/login`
- After login, users are redirected by role:
  - `admin` -> `/dashboard`
  - `data_team` -> `/helpers`
  - `sales_team` -> `/sales`
  - `documentation_team` -> `/documentation`
- Session refresh uses Supabase SSR proxy handling

## Database tables used

- `helpers`
- `employers`
- `deals`
- `documentation_cases`
- `finance`
- `profiles`
- `activity_logs`

## Notes

- Helper CRUD is implemented with Next.js server actions
- Sales, documentation, and finance entries are also created with server actions
- Finance profit is calculated automatically on insert
- When Supabase environment variables are missing, the UI falls back to demo data for previewing only

## Deploying to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the same Supabase environment variables in the Vercel project settings.
4. Deploy.

## Useful scripts

```bash
npm run dev
npm run build
npm run lint
```
