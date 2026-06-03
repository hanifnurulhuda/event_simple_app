<template>
  <main class="app-shell">
    <PublicHeader />
    <section class="mx-auto max-w-2xl px-4 pb-12">
      <div class="card">
        <h1 class="text-3xl font-extrabold text-navy">Registrasi Peserta</h1>
        <p class="mt-2 text-slate-600">Isi data sesuai identitas. Nomor WhatsApp dipakai untuk check-in, survey, sertifikat, dan Action Plan.</p>
        <form class="mt-6 grid gap-4" @submit.prevent="submit">
          <div><label class="label">Nama lengkap</label><input v-model="form.name" class="input" required /></div>
          <div><label class="label">Sekolah / Asal</label><input v-model="form.school" class="input" required placeholder="Nama sekolah atau instansi" /></div>
          <div><label class="label">Kelas</label><input v-model="form.class_name" class="input" required placeholder="Contoh: XI IPA 1" /></div>
          <div><label class="label">Nomor WhatsApp</label><input v-model="form.whatsapp" class="input" required inputmode="tel" placeholder="08xxxxxxxxxx" /></div>
          <div>
            <label class="label">Hari acara</label>
            <select v-model="form.event_day" class="input" required>
              <option>17 Juni</option>
              <option>18 Juni</option>
            </select>
          </div>
          <StatusMessage :message="message" :tone="tone" />
          <button class="btn-primary" :disabled="loading">{{ loading ? 'Menyimpan...' : 'Daftar Sekarang' }}</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const router = useRouter()
const loading = ref(false)
const message = ref('')
const tone = ref<'success' | 'error' | 'info'>('info')
const form = reactive({ name: '', school: '', class_name: '', whatsapp: '', event_day: '17 Juni' })

const submit = async () => {
  loading.value = true
  message.value = ''
  try {
    const whatsapp = normalizeWhatsapp(form.whatsapp)
    const participant = {
      ...form,
      whatsapp,
      participant_code: createParticipantCode(),
      qr_token: createQrToken()
    }
    const data = await $fetch<{ participant_code: string }>('/api/participants', {
      method: 'POST',
      body: participant
    })
    await router.push(`/success/${data.participant_code}`)
  } catch (error) {
    tone.value = 'error'
    message.value = getPublicErrorMessage(error, {
      fallback: 'Pendaftaran belum berhasil. Silakan coba lagi atau hubungi panitia.',
      byStatus: {
        400: 'Data pendaftaran belum lengkap. Silakan periksa kembali isian Anda.'
      }
    })
  } finally {
    loading.value = false
  }
}
</script>
