<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto max-w-2xl px-4 pb-12">
      <div class="card">
        <h1 class="text-3xl font-extrabold text-navy">Check-in Kehadiran</h1>
        <p class="mt-2 text-slate-600">QR check-in valid. Masukkan nomor WhatsApp atau kode peserta untuk mencatat kehadiran.</p>
        <form class="mt-6 grid gap-4" @submit.prevent="submit">
          <input v-model="identifier" class="input" required placeholder="08xxxxxxxxxx atau DK-..." />
          <StatusMessage :message="message" :tone="tone" />
          <button class="btn-primary" :disabled="loading || !validEventCode">{{ loading ? 'Memproses...' : 'Catat Kehadiran' }}</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { isValidEventCode } from '~/data/eventQr'
import type { Participant } from '~/types/database'

const route = useRoute()
const identifier = ref('')
const message = ref('')
const tone = ref<'success' | 'error' | 'info'>('info')
const loading = ref(false)
const validEventCode = computed(() => isValidEventCode(String(route.params.event_code || ''), 'checkin'))

onMounted(() => {
  if (!validEventCode.value) {
    tone.value = 'error'
    message.value = 'QR check-in tidak valid. Gunakan QR resmi dari panitia.'
  }
})

const submit = async () => {
  if (!validEventCode.value) return
  loading.value = true
  try {
    const participant = await findParticipant(identifier.value)
    if (!participant) {
      tone.value = 'error'
      message.value = 'Data peserta tidak ditemukan. Periksa nomor WhatsApp atau kode peserta.'
      return
    }
    if (participant.attended) {
      tone.value = 'info'
      message.value = 'Kehadiran Anda sudah pernah tercatat.'
      return
    }

    await $fetch<Participant>(`/api/participants/${participant.id}`, {
      method: 'PATCH',
      body: { attended: true, checked_in_at: new Date().toISOString() }
    })
    tone.value = 'success'
    message.value = 'Kehadiran Anda berhasil tercatat. Terima kasih sudah mengikuti Dialog Kebangsaan.'
  } catch (error) {
    tone.value = 'error'
    message.value = error instanceof Error ? error.message : 'Check-in gagal. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
