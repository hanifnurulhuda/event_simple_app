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

    <section v-if="participant" class="certificate-page mx-auto max-w-4xl bg-white p-10 shadow-2xl" @contextmenu.prevent>
      <div class="flex aspect-[297/210] flex-col border-[10px] border-double border-red-800 bg-[radial-gradient(ellipse_at_top,_#fef2f2_0%,_#fff_70%)] px-16 py-10">
        <div class="flex flex-1 flex-col items-center justify-center gap-2">
          <div class="flex items-center gap-4 text-red-700">
            <span class="block h-px w-16 bg-red-300" />
            <span class="text-xs font-bold uppercase tracking-[0.5em]">Dialog Kebangsaan</span>
            <span class="block h-px w-16 bg-red-300" />
          </div>
          <div class="mt-4 flex items-center gap-3">
            <span class="block h-0.5 w-12 bg-red-700" />
            <span class="text-base font-semibold tracking-[0.3em] text-red-700">SERTIFIKAT</span>
            <span class="block h-0.5 w-12 bg-red-700" />
          </div>
          <div class="mt-4 flex items-center gap-4">
            <span class="block h-0.5 w-10 bg-red-400" />
            <span class="text-sm italic text-slate-400">diberikan kepada</span>
            <span class="block h-0.5 w-10 bg-red-400" />
          </div>
          <h2 class="mt-3 text-5xl font-extrabold text-red-700">{{ participant.name }}</h2>
          <p class="text-xl font-semibold text-slate-600">{{ participant.school }}</p>
          <p class="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-slate-600">Atas partisipasinya dalam kegiatan <strong class="text-navy">Dialog Kebangsaan</strong> dan komitmen pada tema Action Plan <strong class="text-navy">Gen Z Merawat Indonesia</strong> yang diselenggarakan pada tanggal 17–18 Juni 2026.</p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-16">
          <div class="flex flex-col items-center gap-1">
            <div class="h-14 w-full max-w-52 border-b-2 border-slate-300" />
            <p class="mt-1 font-bold text-navy">Dr. H. Ahmad Fauzi, M.Pd.</p>
            <p class="text-xs text-slate-500">Ketua Panitia</p>
          </div>
          <div class="flex flex-col items-center gap-1">
            <div class="h-14 w-full max-w-52 border-b-2 border-slate-300" />
            <p class="mt-1 font-bold text-navy">Dra. Siti Nurhaliza, M.Si.</p>
            <p class="text-xs text-slate-500">Sekretaris Panitia</p>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-4 border-t border-red-100 pt-4 text-xs text-slate-400">
          <div class="text-left"><p class="font-semibold text-navy">No. CERT-{{ participant.participant_code }}</p></div>
          <div class="text-center"><p class="font-semibold text-navy">17–18 Juni 2026</p></div>
          <div class="text-right"><p class="font-semibold text-navy">Jakarta</p></div>
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
        body: {
          participant_code: participant.value.participant_code,
          certificate_status: 'viewed',
          certificate_viewed_at: new Date().toISOString()
        }
      })
    } catch {
      // silent
    }
  }
})
</script>
