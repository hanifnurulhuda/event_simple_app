<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="card">
        <div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-extrabold text-navy">Sertifikat</h1><p class="text-slate-600">Pantau status sertifikat peserta.</p></div><button class="btn-secondary" @click="exportExcel('sertifikat.xlsx', filtered)">Export Sertifikat</button></div>
        <div class="mt-5 grid gap-3 sm:grid-cols-4"><button v-for="item in filters" :key="item.value" :class="filter === item.value ? 'btn-primary' : 'btn-secondary'" @click="filter = item.value">{{ item.label }}</button></div>
         <div class="mt-5 overflow-x-auto"><table class="min-w-full text-left text-sm"><thead class="text-slate-500"><tr><th class="p-2">Kode</th><th class="p-2">Nama</th><th class="p-2">Kelas</th><th v-if="showSchool" class="p-2">Sekolah</th><th class="p-2">Hadir</th><th class="p-2">Survey</th><th class="p-2">Status</th><th class="p-2">Dibuka</th></tr></thead><tbody><tr v-for="p in filtered" :key="p.id" class="border-t"><td class="p-2 font-bold">{{ p.participant_code }}</td><td class="p-2">{{ p.name }}</td><td class="p-2">{{ p.class_name || '-' }}</td><td v-if="showSchool" class="p-2">{{ p.school }}</td><td class="p-2">{{ p.attended ? 'Ya' : 'Belum' }}</td><td class="p-2">{{ p.survey_submitted ? 'Ya' : 'Belum' }}</td>        <td class="p-2">{{ certificateLabel(certificateStatusFor(p)) }}</td><td class="p-2">{{ p.certificate_viewed_at || '-' }}</td></tr></tbody></table></div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

import type { Participant } from '~/types/database'
const participants = ref<Participant[]>([])
const filter = ref('all')
const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Eligible', value: 'eligible' },
  { label: 'Tidak eligible', value: 'not_eligible' },
  { label: 'Sudah dibuka', value: 'viewed' }
]

onMounted(async () => {
  participants.value = await $fetch<Participant[]>('/api/participants')
})

const showSchool = useMultiSchool()

const filtered = computed(() => participants.value.filter((p) => {
  const status = certificateStatusFor(p)
  return filter.value === 'all' || status === filter.value
}))
</script>
