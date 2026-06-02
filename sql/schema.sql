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
  q1 text,
  q2 text,
  q3 text,
  q4 text,
  q5 text,
  q6 text,
  q7 text,
  q8 text,
  q9 text,
  q10 text,
  q11 text,
  q12 text,
  q13 text,
  q14 text,
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

drop trigger if exists survey_questions_set_updated_at on survey_questions;
create trigger survey_questions_set_updated_at before update on survey_questions for each row execute function set_updated_at();

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

alter table participants enable row level security;
alter table survey_responses enable row level security;
alter table action_plans enable row level security;

-- MVP policy: public form and admin dashboard use anon key.
-- For production hardening, move writes/admin reads into Nuxt server routes or proper auth.
drop policy if exists "mvp participants read" on participants;
create policy "mvp participants read" on participants for select using (true);
drop policy if exists "mvp participants insert" on participants;
create policy "mvp participants insert" on participants for insert with check (true);
drop policy if exists "mvp participants update" on participants;
create policy "mvp participants update" on participants for update using (true) with check (true);

drop policy if exists "mvp survey read" on survey_responses;
create policy "mvp survey read" on survey_responses for select using (true);
drop policy if exists "mvp survey insert" on survey_responses;
create policy "mvp survey insert" on survey_responses for insert with check (true);

drop policy if exists "mvp action plan read" on action_plans;
create policy "mvp action plan read" on action_plans for select using (true);
drop policy if exists "mvp action plan insert" on action_plans;
create policy "mvp action plan insert" on action_plans for insert with check (true);

insert into participants (participant_code, qr_token, name, school, class_name, whatsapp, event_day, attended, survey_submitted, action_plan_submitted, certificate_status, judging_status) values
('DK-DUMMY-001', gen_random_uuid()::text, 'Andi Pratama', 'SMAN 2 Padang', 'XI IPA 1', '628111111111', '17 Juni', true, true, true, 'eligible', 'candidate'),
('DK-DUMMY-002', gen_random_uuid()::text, 'Siti Rahma', 'SMAN 2 Padang', 'XI IPS 2', '628111111112', '17 Juni', true, true, false, 'eligible', 'not_reviewed'),
('DK-DUMMY-003', gen_random_uuid()::text, 'Bima Saputra', 'SMAN 2 Padang', 'X-1', '628111111113', '17 Juni', true, false, false, 'not_eligible', 'not_reviewed'),
('DK-DUMMY-004', gen_random_uuid()::text, 'Nadya Kirana', 'SMAN 2 Padang', 'XII IPA 3', '628111111114', '17 Juni', false, false, false, 'not_eligible', 'not_reviewed'),
('DK-DUMMY-005', gen_random_uuid()::text, 'Rafi Ahmad', 'SMAN 2 Padang', 'XI IPA 2', '628111111115', '17 Juni', true, true, true, 'viewed', 'winner_1'),
('DK-DUMMY-006', gen_random_uuid()::text, 'Dewi Lestari', 'SMAN 2 Padang', 'X-2', '628111111116', '18 Juni', true, true, false, 'eligible', 'not_reviewed'),
('DK-DUMMY-007', gen_random_uuid()::text, 'Fajar Maulana', 'SMAN 2 Padang', 'XI IPS 1', '628111111117', '18 Juni', false, false, false, 'not_eligible', 'not_reviewed'),
('DK-DUMMY-008', gen_random_uuid()::text, 'Maya Salsabila', 'SMAN 2 Padang', 'XII IPA 1', '628111111118', '18 Juni', true, true, true, 'eligible', 'inspirational_award'),
('DK-DUMMY-009', gen_random_uuid()::text, 'Gilang Ramadhan', 'SMAN 2 Padang', 'X-3', '628111111119', '18 Juni', true, false, false, 'not_eligible', 'not_reviewed'),
('DK-DUMMY-010', gen_random_uuid()::text, 'Putri Anjani', 'SMAN 2 Padang', 'XI IPA 4', '628111111120', '18 Juni', true, true, true, 'viewed', 'winner_2')
on conflict (whatsapp) do nothing;

insert into action_plans (participant_id, title, description, location, drive_link, social_link, notes)
select id, 'Kampanye Sekolah Bersatu', 'Membuat kampanye digital dan diskusi kelas tentang persatuan.', school, 'https://drive.google.com/example', 'https://instagram.com/example', 'Dummy data'
from participants where participant_code in ('DK-DUMMY-001', 'DK-DUMMY-005', 'DK-DUMMY-008', 'DK-DUMMY-010')
on conflict (participant_id) do nothing;
