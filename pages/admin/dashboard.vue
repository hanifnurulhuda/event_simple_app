<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div><h1 class="text-3xl font-extrabold text-navy">Dashboard</h1><p class="text-slate-600">Ringkasan status peserta Dialog Kebangsaan.</p></div>
        <select v-model="dayFilter" class="input max-w-48" :disabled="loading"><option value="all">Semua hari</option><option>17 Juni</option><option>18 Juni</option></select>
      </div>
      <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
      <template v-else>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="stat in stats" :key="stat.label" class="card"><p class="text-sm font-bold text-slate-500">{{ stat.label }}</p><p class="mt-2 text-3xl font-extrabold text-red-700">{{ stat.value }}</p></div>
      </div>
      <div class="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="card">
          <h2 class="text-xl font-extrabold text-navy">Data per Hari</h2>
          <div class="mt-4 grid gap-4">
            <div v-for="d in dayStats" :key="d.day">
              <p class="mb-2 text-sm font-bold text-navy">{{ d.day }}</p>
              <div class="grid gap-2">
                <div v-for="m in dayMetrics(d)" :key="m.label" class="flex items-center gap-3">
                  <span class="w-16 text-xs font-semibold text-slate-500">{{ m.label }}</span>
                  <div class="h-4 flex-1 rounded-full bg-slate-100">
                    <div class="h-4 rounded-full" :class="m.color" :style="{ width: m.pct + '%' }" />
                  </div>
                  <span class="w-6 text-right text-xs font-bold text-slate-700">{{ m.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <h2 class="mt-6 text-xl font-extrabold text-navy">Data per Kelas</h2>
          <div class="mt-4 grid gap-4">
            <div v-for="k in classStats" :key="k.class_name">
              <p class="mb-2 text-sm font-bold text-navy">{{ k.class_name }}</p>
              <div class="grid gap-2">
                <div v-for="m in classMetrics(k)" :key="m.label" class="flex items-center gap-3">
                  <span class="w-16 text-xs font-semibold text-slate-500">{{ m.label }}</span>
                  <div class="h-4 flex-1 rounded-full bg-slate-100">
                    <div class="h-4 rounded-full" :class="m.color" :style="{ width: m.pct + '%' }" />
                  </div>
                  <span class="w-6 text-right text-xs font-bold text-slate-700">{{ m.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <h2 class="mt-6 text-xl font-extrabold text-navy">Data per Sekolah / Asal</h2>
          <div class="mt-4 grid gap-4">
            <div v-for="s in schoolStats" :key="s.school">
              <p class="mb-2 text-sm font-bold text-navy">{{ s.school }}</p>
              <div class="grid gap-2">
                <div v-for="m in schoolMetrics(s)" :key="m.label" class="flex items-center gap-3">
                  <span class="w-16 text-xs font-semibold text-slate-500">{{ m.label }}</span>
                  <div class="h-4 flex-1 rounded-full bg-slate-100">
                    <div class="h-4 rounded-full" :class="m.color" :style="{ width: m.pct + '%' }" />
                  </div>
                  <span class="w-6 text-right text-xs font-bold text-slate-700">{{ m.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card overflow-x-auto">
          <div class="flex items-center justify-between gap-3"><h2 class="text-xl font-extrabold text-navy">Status cepat</h2><button class="btn-secondary" @click="exportMaster">Export Master Excel</button></div>
          <table class="mt-4 min-w-full text-left text-sm">
            <thead class="text-slate-500"><tr><th class="p-2">Nama</th><th class="p-2">Kelas</th><th class="p-2">Sekolah / Asal</th><th class="p-2">Hari</th><th class="p-2">Hadir</th><th class="p-2">Survey</th><th class="p-2">Action Plan</th></tr></thead>
            <tbody><tr v-for="p in filtered" :key="p.id" class="border-t"><td class="p-2 font-bold">{{ p.name }}</td><td class="p-2">{{ p.class_name || '-' }}</td><td class="p-2">{{ p.school }}</td><td class="p-2">{{ p.event_day }}</td><td class="p-2">{{ p.attended ? 'Ya' : 'Belum' }}</td><td class="p-2">{{ p.survey_submitted ? 'Ya' : 'Belum' }}</td><td class="p-2">{{ p.action_plan_submitted ? 'Ya' : 'Belum' }}</td></tr></tbody>
          </table>
        </div>
      </div>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

import type { Participant } from '~/types/database'

const participants = ref<Participant[]>([])
const dayFilter = ref('all')
const loading = ref(true)

onMounted(async () => {
  participants.value = await $fetch<Participant[]>('/api/participants')
  loading.value = false
})

const filtered = computed(() => dayFilter.value === 'all' ? participants.value : participants.value.filter((p) => p.event_day === dayFilter.value))
const stats = computed(() => [
  { label: 'Total pendaftar', value: filtered.value.length },
  { label: 'Total hadir', value: filtered.value.filter((p) => p.attended).length },
  { label: 'Total survey', value: filtered.value.filter((p) => p.survey_submitted).length },
  { label: 'Action Plan', value: filtered.value.filter((p) => p.action_plan_submitted).length },
  { label: 'Eligible sertifikat', value: filtered.value.filter((p) => p.attended && p.survey_submitted).length }
])
const dayStats = computed(() => {
  const days = ['17 Juni', '18 Juni']
  return days.map(day => {
    const dayPs = participants.value.filter(p => p.event_day === day)
    return {
      day,
      total: dayPs.length,
      hadir: dayPs.filter(p => p.attended).length,
      survey: dayPs.filter(p => p.survey_submitted).length,
      action: dayPs.filter(p => p.action_plan_submitted).length
    }
  }).filter(d => d.total > 0)
})
const classStats = computed(() => {
  const groups: Record<string, Participant[]> = {}
  for (const p of participants.value) {
    const key = p.class_name || '-'
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }
  return Object.entries(groups).map(([class_name, list]) => ({
    class_name,
    total: list.length,
    hadir: list.filter(p => p.attended).length,
    survey: list.filter(p => p.survey_submitted).length,
    action: list.filter(p => p.action_plan_submitted).length
  })).sort((a, b) => a.class_name.localeCompare(b.class_name, undefined, { numeric: true }))
})
const exportMaster = () => exportExcel('dashboard.xlsx', filtered.value)

const schoolStats = computed(() => {
  const groups: Record<string, Participant[]> = {}
  for (const p of participants.value) {
    const key = p.school || '-'
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }
  return Object.entries(groups).map(([school, list]) => ({
    school,
    total: list.length,
    hadir: list.filter(p => p.attended).length,
    survey: list.filter(p => p.survey_submitted).length,
    action: list.filter(p => p.action_plan_submitted).length
  })).sort((a, b) => a.total - b.total).reverse()
})

const dayMax = computed(() => {
  if (!dayStats.value.length) return 1
  return Math.max(...dayStats.value.flatMap(d => [d.total, d.hadir, d.survey, d.action]))
})
const dayMetrics = (d: { total: number; hadir: number; survey: number; action: number }) => [
  { label: 'Total', value: d.total, pct: (d.total / dayMax.value) * 100, color: 'bg-slate-500' },
  { label: 'Hadir', value: d.hadir, pct: (d.hadir / dayMax.value) * 100, color: 'bg-emerald-500' },
  { label: 'Survey', value: d.survey, pct: (d.survey / dayMax.value) * 100, color: 'bg-blue-500' },
  { label: 'Aksi', value: d.action, pct: (d.action / dayMax.value) * 100, color: 'bg-amber-500' }
]

const classMax = computed(() => {
  if (!classStats.value.length) return 1
  return Math.max(...classStats.value.flatMap(k => [k.total, k.hadir, k.survey, k.action]))
})
const classMetrics = (k: { total: number; hadir: number; survey: number; action: number }) => [
  { label: 'Total', value: k.total, pct: (k.total / classMax.value) * 100, color: 'bg-slate-500' },
  { label: 'Hadir', value: k.hadir, pct: (k.hadir / classMax.value) * 100, color: 'bg-emerald-500' },
  { label: 'Survey', value: k.survey, pct: (k.survey / classMax.value) * 100, color: 'bg-blue-500' },
  { label: 'Aksi', value: k.action, pct: (k.action / classMax.value) * 100, color: 'bg-amber-500' }
]

const schoolMax = computed(() => {
  if (!schoolStats.value.length) return 1
  return Math.max(...schoolStats.value.flatMap(s => [s.total, s.hadir, s.survey, s.action]))
})
const schoolMetrics = (s: { total: number; hadir: number; survey: number; action: number }) => [
  { label: 'Total', value: s.total, pct: (s.total / schoolMax.value) * 100, color: 'bg-slate-500' },
  { label: 'Hadir', value: s.hadir, pct: (s.hadir / schoolMax.value) * 100, color: 'bg-emerald-500' },
  { label: 'Survey', value: s.survey, pct: (s.survey / schoolMax.value) * 100, color: 'bg-blue-500' },
  { label: 'Aksi', value: s.action, pct: (s.action / schoolMax.value) * 100, color: 'bg-amber-500' }
]
</script>
