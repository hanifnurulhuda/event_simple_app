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
            <div v-if="loadingQuestions" class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
              <div class="spinner !h-5 !w-5" />
              Memuat pertanyaan survey...
            </div>
            <div v-else-if="!questions.length" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Pertanyaan survey belum tersedia. Silakan hubungi panitia.
            </div>
            <template v-else>
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
            </template>
            <StatusMessage :message="message" :tone="tone" />
            <button class="btn-primary" :disabled="loading || loadingQuestions || !questions.length">{{ loading ? 'Menyimpan...' : 'Kirim Survey' }}</button>
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
const loadingQuestions = ref(false)
const validating = ref(true)
const validEventCode = ref(false)
const message = ref('')
const tone = ref<'success' | 'error' | 'info'>('info')
const questions = ref<SurveyQuestion[]>([])
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

const loadQuestions = async () => {
  if (questions.value.length || loadingQuestions.value) return
  loadingQuestions.value = true
  try {
    questions.value = await $fetch<SurveyQuestion[]>('/api/survey-questions')
    for (const question of questions.value) {
      answers[question.question_key] ||= ''
    }
  } catch {
    tone.value = 'error'
    message.value = 'Pertanyaan survey gagal dimuat. Coba refresh halaman.'
  } finally {
    loadingQuestions.value = false
  }
}

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
      message.value = 'Anda sudah pernah mengisi survey.'
      return
    }
    participant.value = found
    await loadQuestions()
  } catch {
    tone.value = 'error'
    message.value = 'Data peserta belum bisa dicek. Silakan coba lagi atau hubungi panitia.'
  } finally {
    loading.value = false
  }
}

const submitSurvey = async () => {
  if (!participant.value || !questions.value.length) return
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
    message.value = getPublicErrorMessage(error, {
      fallback: 'Survey belum berhasil dikirim. Silakan coba lagi atau hubungi panitia.',
      byStatus: {
        400: 'Data survey belum lengkap. Silakan periksa kembali isian Anda.',
        403: 'QR survey tidak valid. Gunakan QR resmi dari panitia.'
      }
    })
  } finally {
    loading.value = false
  }
}
</script>
