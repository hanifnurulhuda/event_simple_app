<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <div v-if="toast" class="fixed right-4 top-20 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800 shadow-xl no-print">
      {{ toast }}
    </div>
    <section class="mx-auto max-w-5xl px-4 py-8">
      <div class="card no-print mb-6">
        <h1 class="text-3xl font-extrabold text-navy">QR Acara</h1>
        <p class="mt-2 text-slate-600">Tampilkan atau cetak QR ini di lokasi acara. Peserta scan QR dengan kamera HP/browser bawaan, lalu input nomor WhatsApp atau kode peserta di halaman yang terbuka. 
          <!-- <strong class="text-red-700">Generate ulang akan mengganti kode QR — QR lama tidak bisa dipakai lagi.</strong> -->
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <button class="btn-primary" @click="printAll">Print Semua QR</button>
          <!-- <button class="btn-secondary" @click="confirmRegenerate">Generate Ulang QR</button> -->
        </div>
      </div>

      <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
      <div v-else class="qr-print-grid grid gap-6 md:grid-cols-2">
        <section class="qr-checkin-section card text-center">
          <p class="text-sm font-bold uppercase tracking-wider text-red-700">QR Check-in</p>
          <h2 class="mt-2 text-2xl font-extrabold text-navy">Kehadiran Peserta</h2>
          <div class="mt-5"><ParticipantQr :value="checkinUrl" /></div>
          <p class="mt-4 break-all rounded-2xl bg-slate-100 p-3 text-xs font-semibold text-slate-600">{{ checkinUrl }}</p>
          <button class="btn-secondary no-print mt-4 w-full" @click="printCheckin">Print QR Check-in</button>
        </section>

        <section class="qr-survey-section card text-center">
          <p class="text-sm font-bold uppercase tracking-wider text-red-700">QR Survey</p>
          <h2 class="mt-2 text-2xl font-extrabold text-navy">Buka Form Survey</h2>
          <div class="mt-5"><ParticipantQr :value="surveyUrl" /></div>
          <p class="mt-4 break-all rounded-2xl bg-slate-100 p-3 text-xs font-semibold text-slate-600">{{ surveyUrl }}</p>
          <button class="btn-secondary no-print mt-4 w-full" @click="printSurvey">Print QR Survey</button>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

import { createEventCode } from '~/data/eventQr'

const checkinUrl = ref('')
const surveyUrl = ref('')
const toast = ref('')
const loading = ref(true)
let toastTimer: ReturnType<typeof setTimeout> | undefined

const printAll = async () => {
  await nextTick()
  window.print()
}

const printCheckin = async () => {
  document.documentElement.classList.add('print-target-checkin')
  await nextTick()
  window.print()
}

const printSurvey = async () => {
  document.documentElement.classList.add('print-target-survey')
  await nextTick()
  window.print()
}

const confirmRegenerate = () => {
  if (window.confirm('PERINGATAN: Generate ulang akan mengganti kode QR Check-in dan Survey.\n\nQR yang sudah tersebar atau tercetak TIDAK BISA dipakai lagi.\n\nLanjutkan?')) {
    generateQrUrls()
  }
}

const generateQrUrls = (showToast = true) => {
  if (!import.meta.client) return
  checkinUrl.value = `${window.location.origin}/checkin/${createEventCode('checkin')}`
  surveyUrl.value = `${window.location.origin}/survey/${createEventCode('survey')}`
  loading.value = false
  if (showToast) {
    toast.value = 'QR Check-in dan Survey berhasil digenerate ulang.'
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast.value = ''
    }, 3000)
  }
}

onMounted(() => {
  generateQrUrls(false)
  window.addEventListener('afterprint', () => {
    document.documentElement.classList.remove('print-target-checkin', 'print-target-survey')
  })
})
</script>
