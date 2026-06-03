<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="card">
        <div class="flex flex-wrap justify-between gap-3"><div><h1 class="text-3xl font-extrabold text-navy">Action Plan</h1><p class="text-slate-600">Review URL Action Plan dan status seleksi manual.</p></div><button class="btn-secondary" :disabled="exporting" @click="exportAll">{{ exporting ? 'Exporting...' : 'Export Action Plan' }}</button></div>
        <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
        <template v-else>
        <div class="mt-5 grid gap-3 md:grid-cols-5"><input v-model="search" class="input md:col-span-2" placeholder="Cari nama, sekolah, judul, isi" /><select v-model="day" class="input"><option value="all">Semua hari</option><option>17 Juni</option><option>18 Juni</option></select><select v-model="judgingStatus" class="input"><option value="all">Semua status</option><option value="not_reviewed">Belum dinilai</option><option value="candidate">Kandidat</option><option value="winner_1">Juara 1</option><option value="winner_2">Juara 2</option><option value="winner_3">Juara 3</option><option value="inspirational_award">Inspirational Award</option></select><select v-model.number="limit" class="input"><option :value="25">25 / halaman</option><option :value="50">50 / halaman</option><option :value="100">100 / halaman</option></select></div>
        <div class="mt-5 grid gap-4">
          <article v-for="plan in plans" :key="plan.id" class="rounded-3xl border border-slate-200 bg-white p-5">
            <div class="flex flex-wrap justify-between gap-3"><div><h2 class="text-xl font-extrabold text-navy">{{ plan.title }}</h2><p class="text-sm font-semibold text-slate-500">{{ plan.participants?.name }} - {{ plan.participants?.school }} - {{ plan.participants?.class_name || '-' }}</p></div><select class="input max-w-60" :value="plan.participants?.judging_status" @change="updateJudging(plan.participant_id, ($event.target as HTMLSelectElement).value)"><option value="not_reviewed">Belum dinilai</option><option value="candidate">Kandidat</option><option value="winner_1">Juara 1</option><option value="winner_2">Juara 2</option><option value="winner_3">Juara 3</option><option value="inspirational_award">Inspirational Award</option></select></div>
            <p class="mt-3 text-slate-700">{{ plan.description }}</p>
            <div class="mt-4 flex flex-wrap gap-3 text-sm font-bold"><a v-if="plan.drive_link" class="break-all text-red-700 underline" :href="plan.drive_link" target="_blank">Buka URL Action Plan</a><span v-if="plan.updated_at">Update: {{ formatDateTime(plan.updated_at) }}</span></div>
          </article>
        </div>
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-600"><span>Menampilkan {{ plans.length }} dari {{ total }} data</span><div class="flex gap-2"><button class="btn-secondary" :disabled="page <= 1 || loading" @click="page--">Sebelumnya</button><span class="rounded-xl bg-slate-100 px-4 py-3">Hal {{ page }} / {{ totalPages }}</span><button class="btn-secondary" :disabled="page >= totalPages || loading" @click="page++">Berikutnya</button></div></div>
      </template>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

import type { ActionPlan } from '~/types/database'
const plans = ref<ActionPlan[]>([])
const loading = ref(true)
const exporting = ref(false)
const search = ref('')
const day = ref('all')
const judgingStatus = ref('all')
const page = ref(1)
const limit = ref(50)
const total = ref(0)
const totalPages = ref(1)
let searchTimer: ReturnType<typeof setTimeout> | undefined

type PaginatedPlans = { data: ActionPlan[]; total: number; page: number; limit: number; totalPages: number }

const queryParams = computed(() => ({ search: search.value, day: day.value, judging_status: judgingStatus.value, page: page.value, limit: limit.value }))

const fetchPlans = async () => {
  loading.value = true
  const response = await $fetch<PaginatedPlans>('/api/action-plans', { query: queryParams.value })
  plans.value = response.data
  total.value = response.total
  totalPages.value = response.totalPages
  loading.value = false
}

onMounted(fetchPlans)

watch([day, judgingStatus, limit], () => {
  if (page.value === 1) fetchPlans()
  else page.value = 1
})

watch(page, fetchPlans)

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value === 1) fetchPlans()
    else page.value = 1
  }, 350)
})

const updateJudging = async (participantId: string, status: string) => {
  await $fetch(`/api/participants/${participantId}`, { method: 'PATCH', body: { judging_status: status } })
}

const rows = computed(() => plans.value.map((plan) => ({
  name: plan.participants?.name,
  class_name: plan.participants?.class_name,
  school: plan.participants?.school,
  participant_code: plan.participants?.participant_code,
  title: plan.title,
  description: plan.description,
  action_url: plan.drive_link,
  submitted_at: formatDateTime(plan.submitted_at),
  updated_at: formatDateTime(plan.updated_at),
  judging_status: plan.participants?.judging_status
})))

const exportAll = async () => {
  exporting.value = true
  const allPlans = await $fetch<ActionPlan[]>('/api/action-plans', { query: { ...queryParams.value, all: '1' } })
  exportExcel('action-plan.xlsx', allPlans.map((plan) => ({
    name: plan.participants?.name,
    class_name: plan.participants?.class_name,
    school: plan.participants?.school,
    participant_code: plan.participants?.participant_code,
    title: plan.title,
    description: plan.description,
    action_url: plan.drive_link,
    submitted_at: formatDateTime(plan.submitted_at),
    updated_at: formatDateTime(plan.updated_at),
    judging_status: plan.participants?.judging_status
  })))
  exporting.value = false
}
</script>
