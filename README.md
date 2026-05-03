# Chalk

A football intelligence platform for coaching staffs. Three modules in one workspace: Film Room for breakdowns, Board for recruiting, Playbook for game plans.

## Modules

- **Film Room** - tag plays, surface tendencies, build self-scout and opponent reports.
- **Board** - evaluate recruits against your scheme with traits-first fit scores.
- **Playbook** - turn the scout report into a weekly call sheet matched to your personnel.

## Intelligence layers

Each module is built on three layers:

1. **Recognition** - pattern detection from film and data (formations, motions, route concepts, prospect traits).
2. **Analytics** - statistical breakdowns and trend identification across your season and an opponent's.
3. **Recommendation** - actionable coaching suggestions: what to call, who to recruit, what to install.

## Tech stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase (auth, Postgres, RLS) via `@supabase/ssr`
- Vercel for hosting

## Local development

```bash
git clone https://github.com/AddisonTech/Chalk.git
cd Chalk
npm install

cp .env.local.example .env.local
# fill in your Supabase URL and anon key

npm run dev
```

The dev server runs at http://localhost:3000. Visit `/login` or `/signup` to get started; the dashboard and module routes are gated behind auth.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon (public) key |

The Supabase project is named `chalk`. Find both values under Project Settings -> API in the Supabase dashboard.

## Database

Migrations live in `supabase/migrations/`. Apply them with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste the files into the Supabase SQL editor in order. The schema:

- `teams`, `team_members` (with a `team_role` enum)
- `films`, `plays` (with a `play_type` enum)
- `prospects`, `prospect_grades`
- `game_plans`

Row-level security is enabled on every table; users only see rows for teams they belong to.

The seed migration creates a "Demo Team" with two films and a handful of tagged plays the first time anyone signs up, and auto-adds new users to it. That gives a fresh sign-up something to look at on the Film Room screen.

## Auth flow

- `/login` and `/signup` are public.
- `/`, `/film-room`, `/board`, `/playbook` are gated by `src/proxy.ts` (Next.js 16's renamed middleware) and the `(app)/layout.tsx` server check. Unauthenticated visitors are redirected to `/login?redirect=<path>`.
- Sign out is a `POST /auth/signout` form in the sidebar.

## Project structure

```
src/
  proxy.ts                      # Session refresh + route guard (Next 16 renamed middleware)
  app/
    layout.tsx                  # Root html/body shell
    globals.css                 # Tailwind + theme tokens
    login/page.tsx              # Public sign-in
    signup/page.tsx             # Public sign-up
    auth/signout/route.ts       # POST sign-out handler
    (app)/                      # Authenticated app shell
      layout.tsx                # Renders Sidebar; redirects to /login if no user
      page.tsx                  # Dashboard
      film-room/page.tsx        # Film Room (films + plays from Supabase)
      board/page.tsx            # Board placeholder
      playbook/page.tsx         # Playbook placeholder
  components/
    Sidebar.tsx                 # Module nav + user menu
    ModuleHeader.tsx            # Header for every module page
    auth/
      LoginForm.tsx
      SignupForm.tsx
      UserMenu.tsx              # Email + sign-out button
    film-room/
      FilmRoom.tsx              # Films list + plays table
      TagPlayDialog.tsx         # New play form
    ui/                         # shadcn/ui primitives
  lib/
    supabase/
      server.ts                 # Server client (cookies via next/headers)
      client.ts                 # Browser client
      middleware.ts             # Session refresh helper used by proxy.ts
    types.ts                    # Film, Play, PlayType
    utils.ts                    # cn()
supabase/
  migrations/
    20260502120000_initial_schema.sql
    20260502120100_seed_demo_data.sql
```

## Build

```bash
npm run build
npm start
```

## License

MIT
