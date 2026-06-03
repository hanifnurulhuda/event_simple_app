<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="card">
        <div class="flex flex-wrap justify-between gap-3"><div><h1 class="text-3xl font-extrabold text-navy">Survey</h1><p class="text-slate-600">Daftar jawaban survey peserta.</p></div><button class="btn-secondary" :disabled="exporting" @click="exportAll">{{ exporting ? 'Exporting...' : 'Export Excel' }}</button></div>
        <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
        <template v-else>
        <div class="mt-5 grid gap-3 md:grid-cols-4"><input v-model="search" class="input md:col-span-2" placeholder="Cari nama, sekolah, kelas, kode" /><select v-model="day" class="input"><option value="all">Semua hari</option><option>17 Juni</option><option>18 Juni</option></select><select v-model.number="limit" class="input"><option :value="25">25 / halaman</option><option :value="50">50 / halaman</option><option :value="100">100 / halaman</option></select></div>
        <div class="mt-5 overflow-x-auto"><table class="min-w-full text-left text-sm"><thead class="text-slate-500"><tr><th class="p-2">Nama</th><th class="p-2">Kelas</th><th class="p-2">Sekolah / Asal</th><th v-for="q in allQuestions" :key="q.question_key" class="p-2 min-w-36">{{ q.label }}</th></tr></thead><tbody><tr v-for="row in rows" :key="row.id" class="border-t"><td class="p-2 font-bold">{{ row.name }}</td><td class="p-2">{{ row.class_name || '-' }}</td><td class="p-2">{{ row.school }}</td><td v-for="q in allQuestions" :key="q.question_key" class="p-2">{{ row.answers?.[q.question_key] || '-' }}</td></tr></tbody></table></div>
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-600"><span>Menampilkan {{ surveys.length }} dari {{ total }} data</span><div class="flex gap-2"><button class="btn-secondary" :disabled="page <= 1 || loading" @click="page--">Sebelumnya</button><span class="rounded-xl bg-slate-100 px-4 py-3">Hal {{ page }} / {{ totalPages }}</span><button class="btn-secondary" :disabled="page >= totalPages || loading" @click="page++">Berikutnya</button></div></div>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

import type { SurveyResponse } from '~/types/database'
const surveys = ref<SurveyResponse[]>([])
const questions = ref<SurveyQuestion[]>([])
const loading = ref(true)
const exporting = ref(false)
const search = ref('')
const day = ref('all')
const page = ref(1)
const limit = ref(50)
const total = ref(0)
const totalPages = ref(1)
let searchTimer: ReturnType<typeof setTimeout> | undefined

type PaginatedSurveys = { data: SurveyResponse[]; total: number; page: number; limit: number; totalPages: number }

const queryParams = computed(() => ({ search: search.value, day: day.value, page: page.value, limit: limit.value }))

const fetchSurveys = async () => {
  loading.value = true
  const response = await $fetch<PaginatedSurveys>('/api/survey-responses', { query: queryParams.value })
  surveys.value = response.data
  total.value = response.total
  totalPages.value = response.totalPages
  loading.value = false
}

onMounted(async () => {
  const [surveyData, questionData] = await Promise.all([
    $fetch<PaginatedSurveys>('/api/survey-responses', { query: queryParams.value }),
    $fetch<SurveyQuestion[]>('/api/admin/survey-questions')
  ])
  surveys.value = surveyData.data
  total.value = surveyData.total
  totalPages.value = surveyData.totalPages
  questions.value = questionData
  loading.value = false
})

watch([day, limit], () => {
  if (page.value === 1) fetchSurveys()
  else page.value = 1
})

watch(page, fetchSurveys)

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value === 1) fetchSurveys()
    else page.value = 1
  }, 350)
})

const allQuestions = computed(() =>
  [...questions.value].sort((a, b) => a.sort_order - b.sort_order)
)

const rows = computed(() => surveys.value.map((survey) => ({
  id: survey.id,
  name: survey.participants?.name || '',
  class_name: survey.participants?.class_name || '',
  school: survey.participants?.school || '',
  participant_code: survey.participants?.participant_code || '',
  answers: survey.answers || {}
})))

const exportAll = async () => {
  exporting.value = true
  const allSurveys = await $fetch<SurveyResponse[]>('/api/survey-responses', { query: { ...queryParams.value, all: '1' } })
  exportExcel('survey.xlsx', allSurveys.map((survey) => ({
    name: survey.participants?.name || '',
    class_name: survey.participants?.class_name || '',
    school: survey.participants?.school || '',
    participant_code: survey.participants?.participant_code || '',
    answers: survey.answers || {}
  })))
  exporting.value = false
}
</script>
