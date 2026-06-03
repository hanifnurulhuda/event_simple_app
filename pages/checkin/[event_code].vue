<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto max-w-2xl px-4 pb-12">
      <div class="card">
        <div v-if="validating" class="flex justify-center py-8"><div class="spinner" /></div>
        <template v-else-if="validEventCode">
          <h1 class="text-3xl font-extrabold text-navy">Check-in Kehadiran</h1>
          <p class="mt-2 text-slate-600">QR check-in valid. Masukkan nomor WhatsApp atau kode peserta untuk mencatat kehadiran.</p>
          <form class="mt-6 grid gap-4" @submit.prevent="submit">
            <input v-model="identifier" class="input" required placeholder="08xxxxxxxxxx atau DK-..." />
            <StatusMessage :message="message" :tone="tone" />
            <button class="btn-primary" :disabled="loading">{{ loading ? 'Memproses...' : 'Catat Kehadiran' }}</button>
          </form>
        </template>
        <template v-else-if="!validEventCode">
          <h1 class="text-3xl font-extrabold text-navy">Tidak Valid</h1>
          <p class="mt-2 text-slate-600">QR check-in tidak valid. Gunakan QR resmi dari panitia.</p>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Participant } from '~/types/database'

const route = useRoute()
const identifier = ref('')
const message = ref('')
const tone = ref<'success' | 'error' | 'info'>('info')
const loading = ref(false)
const validating = ref(true)
const validEventCode = ref(false)

onMounted(async () => {
  const eventCode = String(route.params.event_code || '')
  try {
    const { code } = await $fetch<{ code: string }>('/api/event-qr-codes/checkin')
    validEventCode.value = code === eventCode
  } catch {
    validEventCode.value = false
  }
  validating.value = false
})

const submit = async () => {
  if (!validEventCode.value) return
  loading.value = true
  try {
    const participant = await $fetch<Participant & { was_already_attended?: boolean }>('/api/checkin', {
      method: 'POST',
      body: {
        identifier: identifier.value,
        whatsapp: normalizeWhatsapp(identifier.value),
        event_code: String(route.params.event_code || '')
      }
    })
    if (!participant) {
      tone.value = 'error'
      message.value = 'Data peserta tidak ditemukan. Periksa nomor WhatsApp atau kode peserta.'
      return
    }
    if (participant.was_already_attended) {
      tone.value = 'info'
      message.value = 'Kehadiran Anda sudah pernah tercatat.'
      return
    }
    tone.value = 'success'
    message.value = 'Kehadiran Anda berhasil tercatat. Terima kasih sudah mengikuti Dialog Kebangsaan.'
  } catch (error) {
    tone.value = 'error'
    message.value = getPublicErrorMessage(error, {
      fallback: 'Check-in belum berhasil. Silakan coba lagi atau hubungi panitia.',
      byStatus: {
        400: 'Nomor WhatsApp atau kode peserta wajib diisi.',
        403: 'QR check-in tidak valid. Gunakan QR resmi dari panitia.',
        404: 'Data peserta tidak ditemukan. Periksa nomor WhatsApp atau kode peserta.'
      }
    })
  } finally {
    loading.value = false
  }
}
</script>
