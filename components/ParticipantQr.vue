<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-4 text-center">
    <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR check-in peserta" class="mx-auto h-56 w-56 rounded-2xl bg-white p-2" />
    <div v-else class="mx-auto grid h-56 w-56 place-items-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500">Membuat QR...</div>
    <p class="mt-3 text-xs font-semibold text-slate-500">Scan QR ini saat acara untuk mencatat kehadiran.</p>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'

const props = defineProps<{ value: string }>()
const qrDataUrl = ref('')

watchEffect(async () => {
  if (!props.value) return
  qrDataUrl.value = await QRCode.toDataURL(props.value, {
    margin: 2,
    width: 320,
    errorCorrectionLevel: 'M'
  })
})
</script>
