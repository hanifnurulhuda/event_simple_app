<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="card">
        <div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-extrabold text-navy">Data Peserta</h1><p class="text-slate-600">Search, filter, export, dan copy nomor WhatsApp.</p></div><button class="btn-secondary" @click="exportExcel('peserta.xlsx', filtered)">Export Excel</button></div>
        <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
        <template v-else>
        <div class="mt-5 grid gap-3 md:grid-cols-5">
          <input v-model="search" class="input md:col-span-2" placeholder="Cari nama, sekolah, WA, kode" />
          <select v-model="day" class="input"><option value="all">Semua hari</option><option>17 Juni</option><option>18 Juni</option></select>
          <select v-model="status" class="input"><option value="all">Semua status</option><option value="attended">Hadir</option><option value="not_attended">Belum hadir</option><option value="survey">Sudah survey</option><option value="action">Sudah action plan</option><option value="certificate">Eligible sertifikat</option></select>
        </div>
          <div class="mt-5 overflow-x-auto"><table class="min-w-full text-left text-sm"><thead class="text-slate-500"><tr><th class="p-2">Kode</th><th class="p-2">Nama</th><th class="p-2">Kelas</th><th class="p-2">Sekolah / Asal</th><th class="p-2">WA</th><th class="p-2">Hari</th><th class="p-2">Hadir</th><th class="p-2">Survey</th><th class="p-2">Action</th><th class="p-2">Sertifikat</th></tr></thead><tbody><tr v-for="p in filtered" :key="p.id" class="border-t"><td class="p-2 font-bold">{{ p.participant_code }}</td><td class="p-2">{{ p.name }}</td><td class="p-2">{{ p.class_name || '-' }}</td><td class="p-2">{{ p.school }}</td><td class="p-2">{{ p.whatsapp }}</td><td class="p-2">{{ p.event_day }}</td><td class="p-2">{{ p.attended ? 'Ya' : 'Belum' }}</td><td class="p-2">{{ p.survey_submitted ? 'Ya' : 'Belum' }}</td><td class="p-2">{{ p.action_plan_submitted ? 'Ya' : 'Belum' }}</td>        <td class="p-2">{{ certificateLabel(certificateStatusFor(p)) }}</td></tr></tbody></table></div>
      </template>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

import type { Participant } from '~/types/database'

const participants = ref<Participant[]>([])
const search = ref('')
const day = ref('all')
const status = ref('all')
const loading = ref(true)

onMounted(async () => {
  participants.value = await $fetch<Participant[]>('/api/participants')
  loading.value = false
})

const filtered = computed(() => participants.value.filter((p) => {
  const text = `${p.name} ${p.school} ${p.class_name} ${p.whatsapp} ${p.participant_code}`.toLowerCase()
  const matchText = text.includes(search.value.toLowerCase())
  const matchDay = day.value === 'all' || p.event_day === day.value
  const matchStatus = status.value === 'all' || (status.value === 'attended' && p.attended) || (status.value === 'not_attended' && !p.attended) || (status.value === 'survey' && p.survey_submitted) || (status.value === 'action' && p.action_plan_submitted) || (status.value === 'certificate' && p.attended && p.survey_submitted)
  return matchText && matchDay && matchStatus
}))
</script>
