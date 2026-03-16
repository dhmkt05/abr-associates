# ABR Associates Admin Dashboard

Private internal business management system for ABR Associates, built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase Auth/database.

## Features

- Admin login with Supabase Auth
- Protected dashboard pages for authenticated users only
- Dashboard overview with business KPIs and recent activity
- Helper database with add, edit, delete, and search
- Sales pipeline for employers and helper matching
- Documentation tracker for post-confirmation stages
- Finance tracker with automatic profit calculation
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
3. Run `supabase/seed.sql` if you want example records.
4. In Supabase Auth, create the manager user manually.
5. Confirm RLS policies allow `authenticated` users to read and write.

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
- Session refresh uses Supabase SSR proxy handling

## Database tables used

- `helpers`
- `employers`
- `deals`
- `documentation_cases`
- `finance`

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
