Buatkan SQL schema Supabase PostgreSQL untuk sistem event Dialog Kebangsaan dengan fitur:
- participants
- survey_responses
- action_plans
- admin_users
- attendance tracking sederhana
- certificate status
- judging status manual

Gunakan UUID primary key.
Tambahkan index untuk:
- participants.whatsapp
- participants.participant_code
- participants.qr_token
- participants.event_day
- participants.school
- participants.attended
- participants.survey_submitted
- participants.action_plan_submitted

Tambahkan trigger updated_at otomatis.
Tambahkan constraint agar whatsapp unique.
Tambahkan sample insert data dummy 10 peserta.
Jangan buat schema terlalu kompleks.