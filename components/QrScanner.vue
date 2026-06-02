<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-4">
    <div v-if="canUseLiveCamera" :id="elementId" class="overflow-hidden rounded-2xl bg-slate-100" />
    <div v-else class="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
      Live camera tidak tersedia di browser/URL ini. Gunakan tombol ambil foto QR di bawah.
    </div>
    <p class="mt-3 text-center text-xs font-semibold text-slate-500">Izinkan akses kamera, lalu arahkan ke QR acara.</p>
    <button v-if="started" class="btn-secondary mt-4 w-full" type="button" @click="stopScanner">Matikan Kamera</button>
    <label class="btn-primary mt-4 w-full cursor-pointer">
      Ambil Foto QR
      <input class="hidden" type="file" accept="image/*" capture="environment" @change="scanPhoto" />
    </label>
    <div :id="photoElementId" class="hidden" />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ scanned: [value: string], error: [message: string] }>()

const elementId = `qr-scanner-${Math.random().toString(36).slice(2)}`
const photoElementId = `photo-scanner-${Math.random().toString(36).slice(2)}`
const started = ref(false)
const canUseLiveCamera = ref(true)
let scanner: { start: Function, stop: Function, clear: Function } | null = null
let Html5QrcodeClass: any = null

const stopScanner = async () => {
  if (!scanner || !started.value) return
  await scanner.stop()
  scanner.clear()
  started.value = false
}

onMounted(async () => {
  try {
    const module = await import('html5-qrcode')
    Html5QrcodeClass = module.Html5Qrcode

    if (!window.isSecureContext) {
      canUseLiveCamera.value = false
      emit('error', 'Live camera membutuhkan HTTPS. Untuk HTTP LAN, gunakan tombol Ambil Foto QR.')
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      canUseLiveCamera.value = false
      emit('error', 'Browser ini tidak mendukung live camera. Gunakan tombol Ambil Foto QR.')
      return
    }

    scanner = new Html5QrcodeClass(elementId)
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 8, qrbox: { width: 240, height: 240 } },
      async (decodedText: string) => {
        emit('scanned', decodedText)
        await stopScanner()
      },
      () => {}
    )
    started.value = true
  } catch (error) {
    canUseLiveCamera.value = false
    emit('error', error instanceof Error ? error.message : 'Kamera tidak bisa dibuka.')
  }
})

const scanPhoto = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    if (!Html5QrcodeClass) {
      const module = await import('html5-qrcode')
      Html5QrcodeClass = module.Html5Qrcode
    }
    const photoScanner = new Html5QrcodeClass(photoElementId)
    const decodedText = await photoScanner.scanFile(file, false)
    emit('scanned', decodedText)
  } catch {
    emit('error', 'QR tidak terbaca dari foto. Ambil foto lebih dekat dan pastikan QR tidak blur.')
  } finally {
    input.value = ''
  }
}

onBeforeUnmount(async () => {
  await stopScanner()
})
</script>
