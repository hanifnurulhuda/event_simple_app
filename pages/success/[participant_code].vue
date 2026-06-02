<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto max-w-2xl px-4 pb-12">
      <div class="card text-center">
        <p class="text-sm font-bold uppercase tracking-wider text-red-700">Pendaftaran berhasil</p>
        <h1 class="mt-2 text-3xl font-extrabold text-navy">Simpan kode peserta Anda</h1>
        <div class="mx-auto my-6 rounded-3xl border-4 border-dashed border-red-200 bg-red-50 px-4 py-7 text-3xl font-extrabold text-red-700">{{ code }}</div>
        <p class="text-slate-600">Pendaftaran berhasil. Simpan kode peserta Anda untuk check-in, survey, sertifikat, dan Action Plan.</p>
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <NuxtLink class="btn-primary" to="/checkin">Check-in</NuxtLink>
          <NuxtLink class="btn-secondary" to="/survey">Survey</NuxtLink>
          <NuxtLink class="btn-secondary" to="/certificate">Sertifikat</NuxtLink>
          <NuxtLink class="btn-secondary" to="/action-plan">Action Plan</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const code = computed(() => String(route.params.participant_code || '').toUpperCase())
</script>
