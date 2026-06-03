<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <div v-if="toast" class="fixed right-4 top-20 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800 shadow-xl no-print">
      {{ toast }}
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print" @click.self="showModal = false">
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">⚠️</div>
          <h2 class="mt-4 text-xl font-extrabold text-navy">{{ modalTitle }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">{{ modalBody }}</p>
          <p v-if="modalWarning" class="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">{{ modalWarning }}</p>
          <div class="mt-6 flex gap-3">
            <button class="btn-secondary flex-1" @click="showModal = false">Batal</button>
            <button class="btn-primary flex-1" @click="confirmAction">Ya, Generate</button>
          </div>
        </div>
      </div>
    </Teleport>

    <section class="mx-auto max-w-5xl px-4 py-8">
      <div class="card no-print mb-6">
        <h1 class="text-3xl font-extrabold text-navy">QR Acara</h1>
        <p class="mt-2 text-slate-600">Tampilkan atau cetak QR ini di lokasi acara. Peserta scan QR dengan kamera HP/browser bawaan, lalu input nomor WhatsApp atau kode peserta di halaman yang terbuka.</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <button class="btn-primary" @click="printAll">Print Semua QR</button>
          <button class="btn-secondary" @click="openModal('all')">Generate Ulang Semua</button>
        </div>
      </div>

      <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
      <div v-else class="qr-print-grid grid gap-6 md:grid-cols-2">
        <section class="qr-checkin-section card text-center">
          <p class="text-sm font-bold uppercase tracking-wider text-red-700">QR Check-in</p>
          <h2 class="mt-2 text-2xl font-extrabold text-navy">Kehadiran Peserta</h2>
          <button class="no-print mt-4 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700" @click="openModal('checkin')">Generate QR Check-in</button>
          <div class="mt-5"><ParticipantQr :value="checkinUrl" /></div>
          <p class="mt-3 text-xs font-semibold text-slate-500">Digenerate: {{ formatDateTime(checkinGeneratedAt) }}</p>
          <p class="mt-4 break-all rounded-2xl bg-slate-100 p-3 text-xs font-semibold text-slate-600">{{ checkinUrl }}</p>
          <button class="no-print mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100" @click="printCheckin">Download / Print QR Check-in</button>
        </section>

        <section class="qr-survey-section card text-center">
          <p class="text-sm font-bold uppercase tracking-wider text-red-700">QR Survey</p>
          <h2 class="mt-2 text-2xl font-extrabold text-navy">Buka Form Survey</h2>
          <button class="no-print mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700" @click="openModal('survey')">Generate QR Survey</button>
          <div class="mt-5"><ParticipantQr :value="surveyUrl" /></div>
          <p class="mt-3 text-xs font-semibold text-slate-500">Digenerate: {{ formatDateTime(surveyGeneratedAt) }}</p>
          <p class="mt-4 break-all rounded-2xl bg-slate-100 p-3 text-xs font-semibold text-slate-600">{{ surveyUrl }}</p>
          <button class="no-print mt-4 w-full rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100" @click="printSurvey">Download / Print QR Survey</button>
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
const checkinGeneratedAt = ref<string | null>(null)
const surveyGeneratedAt = ref<string | null>(null)
const toast = ref('')
const loading = ref(true)
const showModal = ref(false)
const modalTitle = ref('')
const modalBody = ref('')
const modalWarning = ref('')
let modalTarget = ref<'all' | 'checkin' | 'survey'>('all')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const saveCodes = async (target: 'all' | 'checkin' | 'survey' = 'all') => {
  const checkin = checkinUrl.value.split('/checkin/')[1] || ''
  const survey = surveyUrl.value.split('/survey/')[1] || ''
  const body = {
    ...(target !== 'survey' && checkin ? { checkin } : {}),
    ...(target !== 'checkin' && survey ? { survey } : {})
  }
  const result = await $fetch<{ updates: { type: 'checkin' | 'survey'; created_at: string }[] }>('/api/admin/event-qr-codes', {
    method: 'POST',
    body
  })
  for (const update of result.updates || []) {
    if (update.type === 'checkin') checkinGeneratedAt.value = update.created_at
    if (update.type === 'survey') surveyGeneratedAt.value = update.created_at
  }
}

const openModal = (target: 'all' | 'checkin' | 'survey') => {
  modalTarget.value = target
  if (target === 'all') {
    modalTitle.value = 'Generate Ulang Semua QR'
    modalBody.value = 'Tindakan ini akan mengganti kode QR Check-in dan Survey dengan kode baru. QR yang sudah tercetak atau tersebar tidak bisa dipakai lagi.'
    modalWarning.value = 'Setelah digenerate, cetak ulang QR dan ganti di lokasi acara.'
  } else if (target === 'checkin') {
    modalTitle.value = 'Generate QR Check-in'
    modalBody.value = 'QR Check-in akan diganti dengan kode baru. QR Check-in lama tidak bisa dipakai lagi.'
    modalWarning.value = 'Pastikan QR baru sudah dicetak dan ditempel sebelum acara dimulai.'
  } else {
    modalTitle.value = 'Generate QR Survey'
    modalBody.value = 'QR Survey akan diganti dengan kode baru. QR Survey lama tidak bisa dipakai lagi.'
    modalWarning.value = 'Pastikan QR baru sudah dicetak dan ditempel sebelum acara dimulai.'
  }
  showModal.value = true
}

const confirmAction = async () => {
  showModal.value = false
  if (modalTarget.value === 'all') {
    generateCheckinUrl()
    generateSurveyUrl()
    showToast('QR Check-in dan Survey berhasil digenerate ulang.')
  } else if (modalTarget.value === 'checkin') {
    generateCheckinUrl()
    showToast('QR Check-in berhasil digenerate ulang.')
  } else {
    generateSurveyUrl()
    showToast('QR Survey berhasil digenerate ulang.')
  }
  await saveCodes(modalTarget.value)
}

const generateCheckinUrl = () => {
  checkinUrl.value = `${window.location.origin}/checkin/${createEventCode('checkin')}`
}
const generateSurveyUrl = () => {
  surveyUrl.value = `${window.location.origin}/survey/${createEventCode('survey')}`
}

const showToast = (message: string) => {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3000)
}

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

onMounted(async () => {
  let generatedMissingCode = false
  try {
    const [checkin, survey] = await Promise.all([
      $fetch<{ code: string; created_at: string }>('/api/event-qr-codes/checkin').catch(() => null),
      $fetch<{ code: string; created_at: string }>('/api/event-qr-codes/survey').catch(() => null)
    ])
    if (checkin) {
      checkinUrl.value = `${window.location.origin}/checkin/${checkin.code}`
      checkinGeneratedAt.value = checkin.created_at
    }
    if (survey) {
      surveyUrl.value = `${window.location.origin}/survey/${survey.code}`
      surveyGeneratedAt.value = survey.created_at
    }
  } catch {}
  const missingTargets: Array<'checkin' | 'survey'> = []
  if (!checkinUrl.value) {
    generateCheckinUrl()
    generatedMissingCode = true
    missingTargets.push('checkin')
  }
  if (!surveyUrl.value) {
    generateSurveyUrl()
    generatedMissingCode = true
    missingTargets.push('survey')
  }
  if (generatedMissingCode) {
    if (missingTargets.length === 2) await saveCodes('all')
    else await saveCodes(missingTargets[0])
  }
  loading.value = false
  window.addEventListener('afterprint', () => {
    document.documentElement.classList.remove('print-target-checkin', 'print-target-survey')
  })
})
</script>
