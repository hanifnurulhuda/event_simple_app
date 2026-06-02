<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto max-w-2xl px-4 pb-12">
      <div class="card">
        <h1 class="text-3xl font-extrabold text-navy">Sertifikat</h1>
        <p class="mt-2 text-slate-600">Masukkan nomor WhatsApp atau kode peserta. Jika memenuhi syarat, Anda akan diarahkan ke halaman sertifikat khusus.</p>
        <form class="mt-6 grid gap-4" @submit.prevent="goToCertificate">
          <input v-model="identifier" class="input" required placeholder="Nomor WhatsApp atau kode peserta" />
          <StatusMessage :message="message" :tone="tone" />
          <button class="btn-primary" :disabled="loading">{{ loading ? 'Memeriksa...' : 'Buka Sertifikat' }}</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const identifier = ref('')
const loading = ref(false)
const message = ref('')
const tone = ref<'success' | 'error' | 'info'>('info')

const goToCertificate = async () => {
  loading.value = true
  try {
    const found = await findParticipant(identifier.value)
    if (!found) {
      tone.value = 'error'
      message.value = 'Data peserta tidak ditemukan.'
      return
    }
    if (!found.attended || !found.survey_submitted) {
      tone.value = 'error'
      message.value = 'Sertifikat hanya tersedia untuk peserta yang sudah hadir dan mengisi survey.'
      return
    }
    await navigateTo(`/certificate/${found.participant_code}`)
  } finally {
    loading.value = false
  }
}
</script>
