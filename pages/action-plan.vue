<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto max-w-3xl px-4 pb-12">
      <div class="card">
        <h1 class="text-3xl font-extrabold text-navy">Action Plan</h1>
        <p class="mt-2 text-slate-600">Tema: Gen Z Merawat Indonesia. Kirim satu URL laporan, foto, video, Google Drive, atau media sosial. Jika submit ulang, URL terbaru akan mengganti data sebelumnya.</p>
        <form v-if="!participant" class="mt-6 grid gap-4" @submit.prevent="loadParticipant">
          <input v-model="identifier" class="input" required placeholder="Nomor WhatsApp atau kode peserta" />
          <StatusMessage :message="message" :tone="tone" />
          <button class="btn-primary" :disabled="loading">Cari Peserta</button>
        </form>
        <form v-else class="mt-6 grid gap-4" @submit.prevent="submit">
          <div class="rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">{{ participant.name }} - {{ participant.school }}</div>
          <div v-if="existing" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p class="font-extrabold">Action Plan sebelumnya sudah terkirim.</p>
            <a v-if="existing.drive_link" class="mt-2 inline-block break-all font-bold underline" :href="existing.drive_link" target="_blank">{{ existing.drive_link }}</a>
            <p class="mt-2 font-semibold">Isi data baru di bawah untuk mengganti submission terakhir.</p>
          </div>
          <div>
            <label class="label">Judul Action Plan</label>
            <input v-model="actionTitle" class="input" required placeholder="Contoh: Gerakan Literasi Kebangsaan di Sekolah" />
          </div>
          <div>
            <label class="label">Deskripsi <span class="text-slate-400">(opsional)</span></label>
            <textarea v-model="actionDescription" class="input min-h-28" placeholder="Ceritakan singkat ide, tujuan, atau kegiatan Action Plan Anda." />
          </div>
          <div>
            <label class="label">URL Action Plan</label>
            <input v-model="actionUrl" class="input" required type="url" placeholder="https://drive.google.com/... atau https://instagram.com/..." />
            <p class="mt-2 text-xs font-semibold text-slate-500">Masukkan link laporan/foto/video/Google Drive/media sosial. Tidak perlu upload file ke sistem.</p>
          </div>
          <StatusMessage :message="message" :tone="tone" />
          <div class="flex flex-wrap gap-3">
            <button class="btn-primary" :disabled="loading">{{ loading ? 'Menyimpan...' : existing ? 'Ganti URL Action Plan' : 'Kirim Action Plan' }}</button>
            <button type="button" class="btn-secondary" @click="resetForm">Cari peserta lain</button>
          </div>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { ActionPlan, Participant } from '~/types/database'

const identifier = ref('')
const participant = ref<Participant | null>(null)
const existing = ref<ActionPlan | null>(null)
const loading = ref(false)
const message = ref('')
const tone = ref<'success' | 'error' | 'info'>('info')
const actionTitle = ref('')
const actionDescription = ref('')
const actionUrl = ref('')

const loadParticipant = async () => {
  loading.value = true
  try {
    const found = await findParticipant(identifier.value)
    if (!found) {
      tone.value = 'error'
      message.value = 'Data peserta tidak ditemukan.'
      return
    }
    participant.value = found
    existing.value = await $fetch<ActionPlan | null>('/api/action-plans', { query: { participant_id: found.id, participant_code: found.participant_code } })
    actionTitle.value = existing.value?.title || ''
    actionDescription.value = existing.value?.description || ''
    actionUrl.value = existing.value?.drive_link || ''
    tone.value = 'info'
    message.value = existing.value ? 'Anda bisa mengganti URL Action Plan dengan link terbaru.' : 'Silakan masukkan URL Action Plan Anda.'
  } catch {
    tone.value = 'error'
    message.value = 'Data peserta belum bisa dicek. Silakan coba lagi atau hubungi panitia.'
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!participant.value) return
  loading.value = true
  try {
    const saved = await $fetch<ActionPlan>('/api/action-plans', {
      method: 'POST',
      body: {
        participant_id: participant.value.id,
        participant_code: participant.value.participant_code,
        title: actionTitle.value,
        description: actionDescription.value,
        action_url: actionUrl.value
      }
    })
    existing.value = saved
    tone.value = 'success'
    message.value = 'Action Plan Anda berhasil dikirim. Panitia akan melakukan seleksi secara manual.'
  } catch (error) {
    tone.value = 'error'
    message.value = getPublicErrorMessage(error, {
      fallback: 'Action Plan belum berhasil dikirim. Silakan coba lagi atau hubungi panitia.'
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  participant.value = null
  existing.value = null
  identifier.value = ''
  actionTitle.value = ''
  actionDescription.value = ''
  actionUrl.value = ''
  message.value = ''
}
</script>
