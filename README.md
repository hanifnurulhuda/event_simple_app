# Dialog Kebangsaan Simple Event App

MVP Nuxt 3 + Tailwind CSS + PostgreSQL lokal untuk registrasi peserta, self check-in, survey 14 pertanyaan, sertifikat HTML printable, Action Plan berbasis link, dashboard admin, dan export CSV.

## Setup Lokal

1. Install dependency: `npm install`
2. Copy `.env.example` menjadi `.env`
3. Isi `DATABASE_URL=postgres://postgres:postgres@localhost:5432/simple_event` dan `NUXT_PUBLIC_ADMIN_PASSWORD`
4. Buat database lokal: `createdb -U postgres simple_event`
5. Jalankan schema: `psql -U postgres -d simple_event -f sql/schema.sql`
6. Jalankan app: `npm run dev`

## Route Publik

- `/`
- `/register`
- `/success/[participant_code]`
- `/checkin`
- `/survey`
- `/certificate`
- `/action-plan`

## Route Admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/participants`
- `/admin/surveys`
- `/admin/action-plans`
- `/admin/certificates`

## Deploy Vercel

Untuk MVP lokal ini app memakai PostgreSQL langsung dari Nuxt server. Jika ingin deploy ke Vercel, gunakan database PostgreSQL hosted yang dapat diakses dari Vercel dan set `DATABASE_URL` ke host tersebut. Jangan gunakan PostgreSQL lokal untuk deploy publik.

## Catatan MVP Budget

Fitur yang sengaja tidak dibuat: WhatsApp gateway otomatis, upload foto/video, generate PDF server-side, scoring juri kompleks, queue worker, realtime websocket, dan VPS. Sertifikat berupa HTML printable dengan `window.print()`.

## Catatan Security

Operasi database sekarang berjalan lewat Nuxt server API, bukan dari frontend langsung. Login admin masih password sederhana untuk MVP; untuk produksi gunakan auth yang lebih kuat.
