Anda adalah Senior Fullstack Engineer, UI/UX Engineer, Database Architect, dan Event System Consultant.

Buatkan aplikasi web sederhana untuk kegiatan “Dialog Kebangsaan” dengan estimasi peserta sekitar 1.000 siswa SMA, dibagi menjadi 2 hari penyelenggaraan yaitu 17 dan 18 Juni.

Tujuan aplikasi:
Membuat sistem event sederhana, murah, ringan, dan mudah digunakan agar panitia tidak perlu rekap manual di banyak file. Semua data peserta, kehadiran, survei, sertifikat, dan action plan harus terhubung dalam satu database/master data.

Gunakan teknologi berikut:

Frontend/Public:
- Nuxt 3
- Tailwind CSS
- Responsive mobile-first karena mayoritas peserta akan akses dari HP
- UI sederhana, ringan, cepat dibuka, dan tidak berat saat digunakan banyak peserta

Backend/Database:
- Supabase PostgreSQL
- Supabase Auth optional untuk admin, atau login admin sederhana menggunakan table admin_users
- Supabase Storage tidak wajib
- File besar untuk Action Plan tidak di-upload ke sistem, cukup input link Google Drive / link media sosial

Deploy:
- Vercel untuk Nuxt 3
- Supabase hosted database
- Tidak menggunakan VPS/server sendiri
- Tidak menggunakan backend berat
- Hindari proses long-running di serverless function

Batasan budget:
Project ini hanya versi MVP sederhana karena budget sekitar 2 juta. Jangan membuat sistem terlalu kompleks. Fokus pada fitur inti yang benar-benar menyelesaikan masalah panitia.

Fitur utama yang harus dibuat:

1. Registration System
Peserta daftar melalui QR registrasi yang mengarah ke halaman:
- /register

Field registrasi:
- Nama lengkap
- Sekolah
- Kelas
- Nomor WhatsApp
- Hari acara: 17 Juni / 18 Juni

Setelah submit:
- Data masuk ke database participants
- Sistem membuat participant_code unik
- Sistem membuat qr_token unik
- Peserta diarahkan ke halaman sukses /success/[participant_code]
- Tampilkan kode peserta dan QR sederhana/link check-in/survey/action plan
- Cegah duplikasi berdasarkan nomor WhatsApp jika memungkinkan

2. QR Attendance System
Peserta melakukan kehadiran dengan scan QR kehadiran acara.

Halaman:
- /checkin

Flow sederhana:
- Peserta input nomor WhatsApp atau kode peserta
- Sistem mencari peserta di database
- Jika ditemukan, set status hadir
- Simpan waktu check-in
- Tampilkan pesan sukses
- Jika sudah pernah check-in, tampilkan bahwa peserta sudah tercatat hadir

Catatan:
Untuk versi simple dan murah, tidak perlu scanner panitia kompleks. Self check-in cukup.

3. Survey System 14 Pertanyaan
Setelah acara, peserta scan QR survey.

Halaman:
- /survey

Flow:
- Peserta input nomor WhatsApp atau kode peserta
- Jika peserta ditemukan, tampilkan form survey 14 pertanyaan
- Setelah submit, simpan ke tabel survey_responses
- Set survey_submitted = true
- Jika sudah pernah mengisi survey, jangan boleh submit ulang kecuali admin reset

Buat struktur 14 pertanyaan fleksibel:
- q1 sampai q14
- Gunakan jenis input campuran: rating, textarea, pilihan sederhana
- Buat pertanyaan bisa mudah diedit dari file config atau array di frontend

4. Certificate Generator HTML Only
Karena budget kecil, sertifikat tidak perlu generate PDF kompleks.

Halaman:
- /certificate

Flow:
- Peserta input nomor WhatsApp atau kode peserta
- Sistem cek eligibility:
  - peserta sudah hadir
  - peserta sudah isi survey
- Jika eligible, tampilkan sertifikat HTML sederhana dengan nama peserta, sekolah, kegiatan, tanggal, dan nomor sertifikat
- Sertifikat bisa diprint langsung dari browser menggunakan window.print()
- Sertifikat tidak perlu generate PDF server-side
- Nama peserta otomatis diambil dari database
- Sertifikat cukup HTML/CSS yang rapi dan printable A4 landscape

Status sertifikat:
- Jika peserta membuka sertifikat, update certificate_viewed_at atau certificate_status = viewed
- Admin bisa melihat siapa yang eligible dan siapa yang sudah membuka sertifikat

5. Action Plan Submission
Setelah acara, peserta diberi waktu 2 minggu untuk membuat aksi nyata dengan tema:
“Gen Z Merawat Indonesia”

Halaman:
- /action-plan

Flow:
- Peserta input nomor WhatsApp atau kode peserta
- Jika ditemukan, tampilkan form Action Plan
- Field:
  - Judul action plan
  - Deskripsi kegiatan
  - Lokasi/sekolah/komunitas
  - Link Google Drive
  - Link media sosial, optional
  - Catatan tambahan
- Peserta tidak upload file langsung ke sistem
- Foto/video/laporan dikirim dalam bentuk URL Google Drive atau link media sosial
- Simpan status action_plan_submitted = true
- Jika sudah submit, tampilkan data yang sudah pernah dikirim

6. Admin Dashboard
Buat halaman admin:
- /admin/login
- /admin/dashboard
- /admin/participants
- /admin/surveys
- /admin/action-plans
- /admin/certificates

Dashboard harus menampilkan:
- Total pendaftar
- Total peserta hadir
- Total peserta belum hadir
- Total pengisi survey
- Total belum isi survey
- Total submit Action Plan
- Total belum submit Action Plan
- Jumlah peserta per sekolah
- Jumlah peserta per hari acara: 17 Juni dan 18 Juni
- Status sertifikat
- Status penilaian manual

Admin participants page:
- Tabel peserta
- Search by nama, sekolah, nomor WA, kode peserta
- Filter by hari acara
- Filter by status hadir
- Filter by status survey
- Filter by status action plan
- Filter by status sertifikat
- Export Excel/CSV

Admin survey page:
- Lihat daftar peserta yang sudah isi survey
- Lihat jawaban survey
- Export survey

Admin action plan page:
- Lihat daftar submission
- Link Google Drive/link sosial bisa diklik
- Status penilaian manual:
  - belum dinilai
  - kandidat
  - juara 1
  - juara 2
  - juara 3
  - inspirational award
- Penilaian tidak perlu sistem scoring kompleks

Admin certificates page:
- Lihat peserta eligible sertifikat
- Lihat peserta belum eligible
- Lihat peserta sudah membuka sertifikat
- Export data sertifikat

7. Export Excel
Buat fitur export data ke Excel/CSV dari dashboard admin.

Minimal export:
- Export participants
- Export attendance
- Export survey responses
- Export action plans
- Export combined master data

Untuk implementasi sederhana:
- Gunakan library xlsx atau export CSV client-side
- Jangan proses berat di server

8. Status Tracking
Setiap peserta harus punya status terhubung:

- registered
- attended
- survey_submitted
- certificate_eligible
- certificate_viewed/downloaded
- action_plan_submitted
- judging_status

Status bisa dihitung dari relasi database atau disimpan sebagai column boolean agar dashboard cepat.

9. WhatsApp Broadcast Optional
Fitur broadcast WhatsApp hanya optional dan jangan dibuat sebagai core system.

Untuk MVP:
- Admin bisa export nomor WhatsApp berdasarkan filter:
  - semua pendaftar
  - peserta hadir
  - belum isi survey
  - belum submit action plan
  - eligible sertifikat
- Buat tombol “Copy WhatsApp Numbers”
- Buat template pesan manual

Jangan integrasikan WhatsApp Gateway otomatis kecuali masuk fase 2, karena akan menambah biaya dan kompleksitas.

10. Support Saat Acara 2 Hari
Sistem harus stabil untuk penggunaan event 17 dan 18 Juni.
Optimasi:
- Halaman public harus ringan
- Jangan load asset besar
- Jangan polling dashboard terlalu sering
- Gunakan query database sederhana
- Tambahkan index pada whatsapp, participant_code, qr_token, event_day
- Siapkan export CSV backup
- Sediakan fallback manual jika internet peserta bermasalah

Database Schema yang disarankan:

Table: participants
Columns:
- id uuid primary key default gen_random_uuid()
- participant_code text unique not null
- qr_token text unique not null
- name text not null
- school text not null
- class_name text not null
- whatsapp text not null unique
- event_day text not null
- attended boolean default false
- checked_in_at timestamp nullable
- survey_submitted boolean default false
- action_plan_submitted boolean default false
- certificate_status text default 'not_eligible'
- certificate_viewed_at timestamp nullable
- judging_status text default 'not_reviewed'
- created_at timestamp default now()
- updated_at timestamp default now()

Table: survey_responses
Columns:
- id uuid primary key default gen_random_uuid()
- participant_id uuid references participants(id) on delete cascade
- q1 text
- q2 text
- q3 text
- q4 text
- q5 text
- q6 text
- q7 text
- q8 text
- q9 text
- q10 text
- q11 text
- q12 text
- q13 text
- q14 text
- submitted_at timestamp default now()

Table: action_plans
Columns:
- id uuid primary key default gen_random_uuid()
- participant_id uuid references participants(id) on delete cascade
- title text not null
- description text not null
- location text nullable
- drive_link text nullable
- social_link text nullable
- notes text nullable
- submitted_at timestamp default now()
- updated_at timestamp default now()

Table: admin_users
Columns:
- id uuid primary key default gen_random_uuid()
- username text unique not null
- password_hash text not null
- name text
- role text default 'admin'
- created_at timestamp default now()

Security:
- Jangan expose Supabase service role key ke frontend
- Public insert/update harus dibatasi
- Gunakan Nuxt server routes untuk operasi sensitif jika perlu
- Admin dashboard harus protected
- Validasi input di frontend dan backend
- Nomor WhatsApp harus dinormalisasi

Routing yang dibuat:

Public routes:
- /
- /register
- /success/[participant_code]
- /checkin
- /survey
- /certificate
- /action-plan

Admin routes:
- /admin/login
- /admin/dashboard
- /admin/participants
- /admin/surveys
- /admin/action-plans
- /admin/certificates

UI Requirement:
- Design bersih, modern, sederhana
- Warna nasional: merah, putih, navy/dark blue
- Mobile-first
- Form besar dan mudah dipakai siswa
- Tampilkan loading state
- Tampilkan success/error message yang jelas
- Admin dashboard gunakan card statistik dan tabel responsif
- Sertifikat HTML dibuat elegan, landscape, printable

Copywriting:
Gunakan bahasa Indonesia formal tapi mudah dipahami siswa SMA.

Contoh pesan sukses registrasi:
“Pendaftaran berhasil. Simpan kode peserta Anda untuk check-in, survey, sertifikat, dan Action Plan.”

Contoh pesan check-in:
“Kehadiran Anda berhasil tercatat. Terima kasih sudah mengikuti Dialog Kebangsaan.”

Contoh pesan survey:
“Terima kasih. Refleksi kegiatan Anda sudah tersimpan.”

Contoh pesan sertifikat belum eligible:
“Sertifikat hanya tersedia untuk peserta yang sudah hadir dan mengisi survey.”

Contoh pesan Action Plan:
“Action Plan Anda berhasil dikirim. Panitia akan melakukan seleksi secara manual.”

Output yang saya butuhkan:
1. Struktur folder Nuxt 3
2. SQL schema Supabase lengkap
3. Setup environment variable
4. Implementasi halaman public
5. Implementasi halaman admin
6. Implementasi export CSV/Excel
7. Implementasi sertifikat HTML printable
8. Contoh data dummy
9. Instruksi deploy ke Vercel
10. Catatan fitur yang sengaja tidak dimasukkan karena budget MVP

Prinsip utama:
- Jangan overengineering
- Jangan pakai VPS
- Jangan upload video/foto ke server
- Jangan generate PDF massal
- Jangan buat WhatsApp gateway otomatis di versi awal
- Fokus ke database terpusat, status tracking, dashboard, dan export data
- Sistem harus cukup stabil untuk sekitar 1.000 peserta