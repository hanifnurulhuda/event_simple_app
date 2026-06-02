-- Dummy data for local development.
-- Requires sql/schema.sql to be run first.
-- via: psql -U postgres -d simple_event -f sql/seed.sql

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
