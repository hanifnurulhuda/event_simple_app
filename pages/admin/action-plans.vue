<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="card">
        <div class="flex flex-wrap justify-between gap-3"><div><h1 class="text-3xl font-extrabold text-navy">Action Plan</h1><p class="text-slate-600">Review URL Action Plan dan status seleksi manual.</p></div><button class="btn-secondary" @click="exportExcel('action-plan.xlsx', rows)">Export Action Plan</button></div>
        <div class="mt-5 grid gap-4">
          <article v-for="plan in plans" :key="plan.id" class="rounded-3xl border border-slate-200 bg-white p-5">
            <div class="flex flex-wrap justify-between gap-3"><div><h2 class="text-xl font-extrabold text-navy">{{ plan.title }}</h2><p class="text-sm font-semibold text-slate-500">{{ plan.participants?.name }}<span v-if="showSchool"> - {{ plan.participants?.school }}</span> - {{ plan.participants?.class_name || '-' }}</p></div><select class="input max-w-60" :value="plan.participants?.judging_status" @change="updateJudging(plan.participant_id, ($event.target as HTMLSelectElement).value)"><option value="not_reviewed">Belum dinilai</option><option value="candidate">Kandidat</option><option value="winner_1">Juara 1</option><option value="winner_2">Juara 2</option><option value="winner_3">Juara 3</option><option value="inspirational_award">Inspirational Award</option></select></div>
            <p class="mt-3 text-slate-700">{{ plan.description }}</p>
            <div class="mt-4 flex flex-wrap gap-3 text-sm font-bold"><a v-if="plan.drive_link" class="break-all text-red-700 underline" :href="plan.drive_link" target="_blank">Buka URL Action Plan</a><span v-if="plan.updated_at">Update: {{ plan.updated_at }}</span></div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

import type { ActionPlan } from '~/types/database'
const plans = ref<ActionPlan[]>([])

onMounted(async () => {
  plans.value = await $fetch<ActionPlan[]>('/api/action-plans')
})

const updateJudging = async (participantId: string, status: string) => {
  await $fetch(`/api/participants/${participantId}`, { method: 'PATCH', body: { judging_status: status } })
}

const showSchool = useMultiSchool()
const rows = computed(() => plans.value.map((plan) => ({
  name: plan.participants?.name,
  class_name: plan.participants?.class_name,
  school: plan.participants?.school,
  participant_code: plan.participants?.participant_code,
  title: plan.title,
  description: plan.description,
  action_url: plan.drive_link,
  submitted_at: plan.submitted_at,
  updated_at: plan.updated_at,
  judging_status: plan.participants?.judging_status
})))
</script>
