<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto grid max-w-6xl gap-6 px-4 pb-12 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div class="card overflow-hidden p-7 sm:p-10">
        <p class="mb-4 inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">17-18 Juni | Gen Z Merawat Indonesia</p>
        <h1 class="text-4xl font-extrabold leading-tight text-navy sm:text-6xl">Dialog Kebangsaan untuk Gen Z Merawat Indonesia.</h1>
        <p class="mt-5 text-lg leading-8 text-slate-600">Daftar sebagai peserta, ikuti check-in melalui QR panitia, isi survey refleksi, kirim Action Plan, dan akses sertifikat dari satu sistem yang mudah digunakan.</p>
        <div class="mt-8 grid gap-3 sm:grid-cols-2">
          <NuxtLink class="btn-primary" to="/register">Daftar Peserta</NuxtLink>
          <NuxtLink class="btn-secondary" to="/checkin">Check-in Kehadiran</NuxtLink>
          <NuxtLink class="btn-secondary" to="/survey">Isi Survey</NuxtLink>
          <NuxtLink class="btn-secondary" to="/action-plan">Kirim Action Plan</NuxtLink>
          <NuxtLink class="btn-secondary" to="/certificate">Buka Sertifikat</NuxtLink>
        </div>
      </div>
      <div class="grid gap-4">
        <div v-for="item in features" :key="item.title" class="card border-l-8 border-l-red-700">
          <p class="text-sm font-bold uppercase tracking-wider text-red-700">{{ item.kicker }}</p>
          <h2 class="mt-1 text-xl font-extrabold text-navy">{{ item.title }}</h2>
          <p class="mt-2 text-slate-600">{{ item.copy }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const features = [
  { kicker: 'Kegiatan', title: '17-18 Juni', copy: 'Peserta mengikuti Dialog Kebangsaan sesuai hari acara yang dipilih saat registrasi.' },
  { kicker: 'Peserta', title: 'Alur mudah dari HP', copy: 'Gunakan nomor WhatsApp atau kode peserta untuk check-in, survey, sertifikat, dan Action Plan.' },
  { kicker: 'Panitia', title: 'Data rapi dan terpantau', copy: 'Panitia dapat melihat pendaftar, kehadiran, survey, sertifikat, Action Plan, dan export data.' }
]
</script>
