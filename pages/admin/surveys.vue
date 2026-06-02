<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="card">
        <div class="flex flex-wrap justify-between gap-3"><div><h1 class="text-3xl font-extrabold text-navy">Survey</h1><p class="text-slate-600">Daftar jawaban survey peserta.</p></div><button class="btn-secondary" @click="exportExcel('survey.xlsx', rows)">Export Excel</button></div>
        <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
        <template v-else>
        <div class="mt-5 overflow-x-auto"><table class="min-w-full text-left text-sm"><thead class="text-slate-500"><tr><th class="p-2">Nama</th><th class="p-2">Kelas</th><th class="p-2">Sekolah / Asal</th><th v-for="q in allQuestions" :key="q.question_key" class="p-2 min-w-36">{{ q.label }}</th></tr></thead><tbody><tr v-for="row in rows" :key="row.id" class="border-t"><td class="p-2 font-bold">{{ row.name }}</td><td class="p-2">{{ row.class_name || '-' }}</td><td class="p-2">{{ row.school }}</td><td v-for="q in allQuestions" :key="q.question_key" class="p-2">{{ row.answers?.[q.question_key] || '-' }}</td></tr></tbody></table></div>
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

onMounted(async () => {
  const [surveyData, questionData] = await Promise.all([
    $fetch<SurveyResponse[]>('/api/survey-responses'),
    $fetch<SurveyQuestion[]>('/api/admin/survey-questions')
  ])
  surveys.value = surveyData
  questions.value = questionData
  loading.value = false
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
</script>
