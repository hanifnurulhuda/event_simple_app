# Dialog Kebangsaan Event App

Nuxt 3 + Tailwind CSS + PostgreSQL MVP for participant registration, self check-in, dynamic survey, printable HTML certificate, link-based Action Plan, and admin dashboard.

## Tech Stack

- **Frontend:** Nuxt 3, Tailwind CSS, Vue 3 (Composition API)
- **Backend:** Nuxt server routes (API), `pg` driver
- **Database:** PostgreSQL (local or cloud)
- **Deploy:** Vercel (nitro preset `vercel`)

## Local Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`
3. Fill in `DATABASE_URL` and `NUXT_PUBLIC_ADMIN_PASSWORD`
4. Create database: `createdb -U postgres simple_event`
5. Run schema: `psql -U postgres -d simple_event -f sql/schema.sql`
6. (Optional) Seed dummy data: `psql -U postgres -d simple_event -f sql/seed.sql`
7. Start dev: `npm run dev -- --port 3001 --host`

## Public Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/register` | Participant registration (name, school, class, WhatsApp, event day) |
| `/success/[code]` | Registration confirmation with participant code |
| `/checkin` | Check-in instructions |
| `/checkin/[event_code]` | Self check-in form (scan QR → enter WhatsApp or code) |
| `/survey` | Survey instructions |
| `/survey/[event_code]` | Dynamic survey form (questions from database) |
| `/certificate` | Certificate search |
| `/certificate/[code]` | Printable HTML certificate (A4 landscape) |
| `/action-plan` | Action Plan form (URL only) |

## Admin Routes

| Route | Description |
|---|---|
| `/admin/login` | Admin login |
| `/admin/dashboard` | Overview stats, per-day/per-class/per-school charts, participant status table |
| `/admin/participants` | Search, filter, export participants |
| `/admin/surveys` | View all survey responses (dynamic columns) |
| `/admin/action-plans` | Review Action Plan URLs, set judging status |
| `/admin/certificates` | Monitor certificate eligibility and view status |
| `/admin/event-qr` | Generate and print QR codes for check-in and survey |
| `/admin/survey-questions` | Add, edit, delete survey questions |

## Admin Auth

- Default password: set via `NUXT_PUBLIC_ADMIN_PASSWORD` env
- Session stored in `dialog-admin` cookie
- Route middleware protects all admin pages

## Database Structure

- `participants` — Registration data, attendance, certificate status
- `survey_responses` — Dynamic JSONB answers linked to participants
- `survey_questions` — Configurable questions (rating/choice/textarea)
- `action_plans` — Participant action plans with judging status
- `admin_users` — Admin accounts

## Features

- **Registration:** Free-text school/origin input, WhatsApp normalization, duplicate detection
- **Check-in:** QR code with URL containing event token + 4-digit code, scan with any camera app
- **Survey:** Dynamic questions from database, stored as JSONB, admin-configurable
- **Certificate:** Printable HTML (A4 landscape), eligibility check (attended + survey completed)
- **Action Plan:** URL-only submission, manual judging (candidate/winners/awards)
- **Admin Dashboard:** Bar charts for per-day, per-class, and per-school data; Excel export
- **Filtering:** By event day, attendance, survey status, certificate eligibility
- **Multi-school:** School column auto-shown/hidden based on `NUXT_PUBLIC_SCHOOL_NAMES` config

## Export

All admin tables support Excel export (`.xlsx`) via SheetJS with filenames matching the page name.

## Deploy

For production deployment, use a PostgreSQL cloud provider (Neon, Supabase, Railway) and set `DATABASE_URL` accordingly. Run `sql/seed.sql` (schema only) on the production database — skip dummy data.

## MVP Limitations

- No WhatsApp gateway
- No file/image upload
- No server-side PDF generation
- No real-time WebSocket
- No complex judging/scoring
- Certificate = printable HTML via `window.print()`
