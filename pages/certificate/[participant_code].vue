<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto max-w-2xl px-4 pb-12">
      <div class="no-print card">
        <h1 class="text-3xl font-extrabold text-navy">Sertifikat Peserta</h1>
        <StatusMessage :message="message" :tone="tone" />
        <div v-if="participant" class="mt-4 flex flex-wrap gap-3">
          <button type="button" class="btn-primary" @click="printCert">Print Sertifikat</button>
          <NuxtLink class="btn-secondary" to="/certificate">Cari Sertifikat Lain</NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="participant" class="certificate-page mx-auto max-w-4xl bg-white p-10 shadow-2xl">
      <div class="flex aspect-[297/210] flex-col justify-between border-[12px] border-double border-red-700 px-14 py-12 text-center">
        <div class="flex flex-1 flex-col justify-center gap-3">
          <p class="text-sm font-bold uppercase tracking-[0.4em] text-red-700">Dialog Kebangsaan</p>
          <h2 class="text-5xl font-extrabold text-navy">Sertifikat Penghargaan</h2>
          <p class="text-xl text-slate-600">Diberikan kepada</p>
          <h3 class="text-5xl font-extrabold text-red-700">{{ participant.name }}</h3>
          <p class="text-2xl font-semibold text-slate-700">{{ participant.school }}</p>
          <p class="mx-auto mt-2 max-w-3xl text-lg leading-8 text-slate-700">Atas partisipasinya dalam kegiatan <strong>Dialog Kebangsaan</strong> dan komitmen pada tema Action Plan <strong>Gen Z Merawat Indonesia</strong>.</p>
        </div>
        <div class="grid grid-cols-3 items-end gap-6 text-sm text-slate-600">
          <div class="text-left"><p>No. Sertifikat</p><p class="font-bold text-navy">CERT-{{ participant.participant_code }}</p></div>
          <div class="text-center"><p>Tanggal Kegiatan</p><p class="font-bold text-navy">17-18 Juni 2026</p></div>
          <div class="text-right"><p>Panitia</p><p class="font-bold text-navy">Dialog Kebangsaan</p></div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const code = String(route.params.participant_code || '')

const { data: participant, error } = await useAsyncData(`certificate-${code}`, () => findParticipant(code))

const tone = ref<'success' | 'error' | 'info'>('info')
const message = ref('')

if (error.value) {
  tone.value = 'error'
  message.value = 'Gagal memuat data peserta.'
} else if (!participant.value) {
  tone.value = 'error'
  message.value = 'Data peserta tidak ditemukan.'
} else if (!participant.value.attended || !participant.value.survey_submitted) {
  tone.value = 'error'
  message.value = 'Sertifikat hanya tersedia untuk peserta yang sudah hadir dan mengisi survey.'
  participant.value = null
} else {
  tone.value = 'success'
  message.value = 'Sertifikat tersedia. Gunakan tombol print untuk mencetak dari browser.'
}

const printCert = () => {
  window.print()
}

onMounted(async () => {
  if (participant.value?.id) {
    try {
      await $fetch(`/api/participants/${participant.value.id}`, {
        method: 'PATCH',
        body: { certificate_status: 'viewed', certificate_viewed_at: new Date().toISOString() }
      })
    } catch {
      // silent - view tracking is non-critical
    }
  }
})
</script>
