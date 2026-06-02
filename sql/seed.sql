-- Run this against your production PostgreSQL database
-- via: psql $DATABASE_URL -f sql/seed.sql

create extension if not exists pgcrypto;

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  participant_code text unique not null,
  qr_token text unique not null,
  name text not null,
  school text not null,
  class_name text not null,
  whatsapp text not null unique,
  event_day text not null check (event_day in ('17 Juni', '18 Juni')),
  attended boolean default false,
  checked_in_at timestamp with time zone,
  survey_submitted boolean default false,
  action_plan_submitted boolean default false,
  certificate_status text default 'not_eligible' check (certificate_status in ('not_eligible', 'eligible', 'viewed')),
  certificate_viewed_at timestamp with time zone,
  judging_status text default 'not_reviewed' check (judging_status in ('not_reviewed', 'candidate', 'winner_1', 'winner_2', 'winner_3', 'inspirational_award')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade not null,
  answers jsonb default '{}'::jsonb,
  submitted_at timestamp with time zone default now(),
  unique (participant_id)
);

create table if not exists action_plans (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade not null unique,
  title text not null,
  description text not null,
  location text,
  drive_link text,
  social_link text,
  notes text,
  submitted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  name text,
  role text default 'admin',
  created_at timestamp with time zone default now()
);

create table if not exists survey_questions (
  id uuid primary key default gen_random_uuid(),
  question_key text unique not null check (question_key ~ '^q[0-9]+$'),
  label text not null,
  type text not null check (type in ('rating', 'choice', 'textarea')),
  options jsonb default '[]'::jsonb,
  sort_order integer not null default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

insert into survey_questions (question_key, label, type, options, sort_order) values
  ('q1', 'Seberapa puas Anda dengan kegiatan Dialog Kebangsaan?', 'rating', '[]'::jsonb, 1),
  ('q2', 'Materi kegiatan mudah dipahami.', 'rating', '[]'::jsonb, 2),
  ('q3', 'Narasumber menyampaikan materi dengan menarik.', 'rating', '[]'::jsonb, 3),
  ('q4', 'Kegiatan ini menambah rasa cinta tanah air.', 'rating', '[]'::jsonb, 4),
  ('q5', 'Kegiatan ini relevan untuk siswa SMA.', 'rating', '[]'::jsonb, 5),
  ('q6', 'Fasilitas dan alur kegiatan sudah baik.', 'rating', '[]'::jsonb, 6),
  ('q7', 'Apa bagian kegiatan yang paling berkesan?', 'textarea', '[]'::jsonb, 7),
  ('q8', 'Apa hal baru yang Anda pelajari?', 'textarea', '[]'::jsonb, 8),
  ('q9', 'Apakah Anda tertarik mengikuti kegiatan lanjutan?', 'choice', '["Ya", "Mungkin", "Tidak"]'::jsonb, 9),
  ('q10', 'Topik lanjutan apa yang Anda harapkan?', 'textarea', '[]'::jsonb, 10),
  ('q11', 'Seberapa siap Anda membuat Action Plan?', 'rating', '[]'::jsonb, 11),
  ('q12', 'Dukungan apa yang Anda butuhkan untuk Action Plan?', 'textarea', '[]'::jsonb, 12),
  ('q13', 'Apakah informasi acara tersampaikan jelas?', 'choice', '["Sangat jelas", "Cukup jelas", "Kurang jelas"]'::jsonb, 13),
  ('q14', 'Saran untuk panitia.', 'textarea', '[]'::jsonb, 14)
on conflict (question_key) do nothing;

create index if not exists participants_whatsapp_idx on participants (whatsapp);
create index if not exists participants_participant_code_idx on participants (participant_code);
create index if not exists participants_qr_token_idx on participants (qr_token);
create index if not exists participants_event_day_idx on participants (event_day);
create index if not exists participants_school_idx on participants (school);
create index if not exists participants_attended_idx on participants (attended);
create index if not exists participants_survey_submitted_idx on participants (survey_submitted);
create index if not exists participants_action_plan_submitted_idx on participants (action_plan_submitted);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists participants_set_updated_at on participants;
create trigger participants_set_updated_at before update on participants for each row execute function set_updated_at();

drop trigger if exists action_plans_set_updated_at on action_plans;
create trigger action_plans_set_updated_at before update on action_plans for each row execute function set_updated_at();

drop trigger if exists survey_questions_set_updated_at on survey_questions;
create trigger survey_questions_set_updated_at before update on survey_questions for each row execute function set_updated_at();
