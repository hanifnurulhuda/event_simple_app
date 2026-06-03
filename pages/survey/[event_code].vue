<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto max-w-3xl px-4 pb-12">
      <div class="card">
        <div v-if="validating" class="flex justify-center py-8"><div class="spinner" /></div>
        <template v-else-if="validEventCode">
          <h1 class="text-3xl font-extrabold text-navy">Survey Refleksi</h1>
          <p class="mt-2 text-slate-600">QR survey valid. Masukkan nomor WhatsApp atau kode peserta, lalu isi pertanyaan singkat.</p>
          <form v-if="!participant" class="mt-6 grid gap-4" @submit.prevent="loadParticipant">
            <input v-model="identifier" class="input" required placeholder="Nomor WhatsApp atau kode peserta" />
            <StatusMessage :message="message" :tone="tone" />
            <button class="btn-primary" :disabled="loading">Cari Peserta</button>
          </form>
          <form v-else class="mt-6 grid gap-5" @submit.prevent="submitSurvey">
            <div class="rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">{{ participant.name }} - {{ participant.school }}</div>
            <div v-for="question in questions" :key="question.question_key">
              <label class="label">{{ question.label }}</label>
              <select v-if="question.type === 'rating'" v-model="answers[question.question_key]" class="input" required>
                <option value="">Pilih rating</option>
                <option v-for="score in [1, 2, 3, 4, 5]" :key="score" :value="String(score)">{{ score }} / 5</option>
              </select>
              <select v-else-if="question.type === 'choice'" v-model="answers[question.question_key]" class="input" required>
                <option value="">Pilih jawaban</option>
                <option v-for="option in question.options" :key="option" :value="option">{{ option }}</option>
              </select>
              <textarea v-else v-model="answers[question.question_key]" class="input min-h-28" required />
            </div>
            <StatusMessage :message="message" :tone="tone" />
            <button class="btn-primary" :disabled="loading">{{ loading ? 'Menyimpan...' : 'Kirim Survey' }}</button>
          </form>
        </template>
        <template v-else-if="!validEventCode">
          <h1 class="text-3xl font-extrabold text-navy">Tidak Valid</h1>
          <p class="mt-2 text-slate-600">QR survey tidak valid. Gunakan QR resmi dari panitia.</p>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Participant, SurveyQuestion } from '~/types/database'

const route = useRoute()
const identifier = ref('')
const participant = ref<Participant | null>(null)
const loading = ref(false)
const validating = ref(true)
const validEventCode = ref(false)
const message = ref('')
const tone = ref<'success' | 'error' | 'info'>('info')
const answers = reactive<Record<string, string>>({})

onMounted(async () => {
  const eventCode = String(route.params.event_code || '')
  try {
    const { code } = await $fetch<{ code: string }>('/api/event-qr-codes/survey')
    validEventCode.value = code === eventCode
  } catch {
    validEventCode.value = false
  }
  validating.value = false
})

const loadParticipant = async () => {
  if (!validEventCode.value) return
  loading.value = true
  message.value = ''
  try {
    const found = await findParticipant(identifier.value)
    if (!found) {
      tone.value = 'error'
      message.value = 'Data peserta tidak ditemukan.'
      return
    }
    if (found.survey_submitted) {
      tone.value = 'info'
      message.value = 'Anda sudah pernah mengisi survey. Hubungi admin jika perlu reset.'
      return
    }
    participant.value = found
  } finally {
    loading.value = false
  }
}

const submitSurvey = async () => {
  if (!participant.value) return
  loading.value = true
  try {
    await $fetch('/api/survey-responses', {
      method: 'POST',
      body: { participant_id: participant.value.id, event_code: String(route.params.event_code || ''), ...answers }
    })
    tone.value = 'success'
    message.value = 'Terima kasih. Refleksi kegiatan Anda sudah tersimpan.'
  } catch (error) {
    tone.value = 'error'
    message.value = error instanceof Error ? error.message : 'Survey gagal disimpan.'
  } finally {
    loading.value = false
  }
}
</script>
