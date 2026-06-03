<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="card">
        <div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-extrabold text-navy">Data Peserta</h1><p class="text-slate-600">Search, filter, export, dan copy nomor WhatsApp.</p></div><button class="btn-secondary" :disabled="exporting" @click="exportAll">{{ exporting ? 'Exporting...' : 'Export Excel' }}</button></div>
        <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
        <template v-else>
        <div class="mt-5 grid gap-3 md:grid-cols-5">
          <input v-model="search" class="input md:col-span-2" placeholder="Cari nama, sekolah, WA, kode" />
          <select v-model="day" class="input"><option value="all">Semua hari</option><option>17 Juni</option><option>18 Juni</option></select>
          <select v-model="status" class="input"><option value="all">Semua status</option><option value="attended">Hadir</option><option value="not_attended">Belum hadir</option><option value="survey">Sudah survey</option><option value="action">Sudah action plan</option><option value="certificate">Eligible sertifikat</option></select>
          <select v-model.number="limit" class="input"><option :value="25">25 / halaman</option><option :value="50">50 / halaman</option><option :value="100">100 / halaman</option></select>
        </div>
          <div class="mt-5 overflow-x-auto"><table class="min-w-full text-left text-sm"><thead class="text-slate-500"><tr><th class="p-2">Kode</th><th class="p-2">Nama</th><th class="p-2">Kelas</th><th class="p-2">Sekolah / Asal</th><th class="p-2">WA</th><th class="p-2">Hari</th><th class="p-2">Hadir</th><th class="p-2">Survey</th><th class="p-2">Action</th><th class="p-2">Sertifikat</th></tr></thead><tbody><tr v-for="p in participants" :key="p.id" class="border-t"><td class="p-2 font-bold">{{ p.participant_code }}</td><td class="p-2">{{ p.name }}</td><td class="p-2">{{ p.class_name || '-' }}</td><td class="p-2">{{ p.school }}</td><td class="p-2">{{ p.whatsapp }}</td><td class="p-2">{{ p.event_day }}</td><td class="p-2">{{ p.attended ? 'Ya' : 'Belum' }}</td><td class="p-2">{{ p.survey_submitted ? 'Ya' : 'Belum' }}</td><td class="p-2">{{ p.action_plan_submitted ? 'Ya' : 'Belum' }}</td>        <td class="p-2">{{ certificateLabel(certificateStatusFor(p)) }}</td></tr></tbody></table></div>
          <div class="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-600"><span>Menampilkan {{ participants.length }} dari {{ total }} data</span><div class="flex gap-2"><button class="btn-secondary" :disabled="page <= 1 || loading" @click="page--">Sebelumnya</button><span class="rounded-xl bg-slate-100 px-4 py-3">Hal {{ page }} / {{ totalPages }}</span><button class="btn-secondary" :disabled="page >= totalPages || loading" @click="page++">Berikutnya</button></div></div>
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
const exporting = ref(false)
const page = ref(1)
const limit = ref(50)
const total = ref(0)
const totalPages = ref(1)
let searchTimer: ReturnType<typeof setTimeout> | undefined

type PaginatedParticipants = { data: Participant[]; total: number; page: number; limit: number; totalPages: number }

const queryParams = computed(() => ({ search: search.value, day: day.value, status: status.value, page: page.value, limit: limit.value }))

const fetchParticipants = async () => {
  loading.value = true
  const response = await $fetch<PaginatedParticipants>('/api/participants', { query: queryParams.value })
  participants.value = response.data
  total.value = response.total
  totalPages.value = response.totalPages
  loading.value = false
}

onMounted(fetchParticipants)

watch([day, status, limit], () => {
  if (page.value === 1) fetchParticipants()
  else page.value = 1
})

watch(page, fetchParticipants)

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value === 1) fetchParticipants()
    else page.value = 1
  }, 350)
})

const exportAll = async () => {
  exporting.value = true
  const rows = await $fetch<Participant[]>('/api/participants', { query: { ...queryParams.value, all: '1' } })
  exportExcel('peserta.xlsx', rows)
  exporting.value = false
}
</script>
