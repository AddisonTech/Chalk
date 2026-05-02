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
- Supabase (auth + Postgres)
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

The dev server runs at http://localhost:3000.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon (public) key |

The Supabase project is named `chalk`. Find both values under Project Settings -> API in the Supabase dashboard.

## Project structure

```
src/
  app/
    page.tsx           # Dashboard
    film-room/page.tsx # Film Room module
    board/page.tsx     # Board module
    playbook/page.tsx  # Playbook module
    layout.tsx         # Root layout with shared sidebar
    globals.css        # Tailwind + theme tokens
  components/
    Sidebar.tsx        # Module navigation
    ModuleHeader.tsx   # Header used on every module page
    ui/                # shadcn/ui primitives
  lib/
    supabase.ts        # Supabase client factory
    utils.ts           # cn() helper
```

## Build

```bash
npm run build
npm start
```

## License

MIT
