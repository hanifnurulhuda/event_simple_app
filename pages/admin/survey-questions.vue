<template>
  <main class="min-h-screen bg-slate-50">
    <AdminHeader />
    <section class="mx-auto max-w-5xl px-4 py-8">
      <div class="card">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-3xl font-extrabold text-navy">Atur Pertanyaan Survey</h1>
            <p class="mt-1 text-slate-600">Tambah, edit, atau hapus pertanyaan. Pertanyaan nonaktif tidak tampil di form survey.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="btn-secondary" @click="addQuestion">Tambah Pertanyaan</button>
            <button class="btn-primary" :disabled="saving" @click="saveAll">{{ saving ? 'Menyimpan...' : 'Simpan Semua' }}</button>
          </div>
        </div>
        <StatusMessage :message="message" :tone="tone" />
        <div v-if="loading" class="mt-12 flex justify-center"><div class="spinner" /></div>
        <template v-else>
        <div class="mt-6 grid gap-6">
          <div v-for="(q, i) in items" :key="q.question_key" class="rounded-2xl border border-slate-200 bg-white p-5">
            <div class="mb-3 flex items-center gap-2">
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white">{{ i + 1 }}</span>
              <code class="text-xs font-bold text-slate-400">{{ q.question_key }}</code>
              <button class="ml-auto text-sm font-bold text-red-600 hover:text-red-800" @click="deleteQuestion(i)">Hapus</button>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="q.is_active" type="checkbox" class="toggle" />
                Aktif
              </label>
            </div>
            <div class="grid gap-4">
              <div>
                <label class="label">Label pertanyaan</label>
                <input v-model="q.label" class="input" required />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Tipe</label>
                  <select v-model="q.type" class="input">
                    <option value="rating">Rating (1-5)</option>
                    <option value="choice">Pilihan Jawaban</option>
                    <option value="textarea">Teks bebas</option>
                  </select>
                </div>
                <div>
                  <label class="label">Urutan</label>
                  <input v-model.number="q.sort_order" type="number" class="input" min="1" max="99" />
                </div>
              </div>
              <div v-if="q.type === 'choice'">
                <label class="label">Pilihan jawaban (pisahkan dengan koma)</label>
                <input v-model="optionsText[q.question_key]" class="input" placeholder="Pilihan 1, Pilihan 2, Pilihan 3" @input="updateOptions(q)" />
              </div>
            </div>
          </div>
        </div>
      </template>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

import type { SurveyQuestion } from '~/types/database'

const message = ref('')
const tone = ref<'success' | 'error' | 'info'>('info')
const saving = ref(false)
const items = ref<SurveyQuestion[]>([])
const optionsText = reactive<Record<string, string>>({})
const loading = ref(true)

onMounted(async () => {
  items.value = await $fetch<SurveyQuestion[]>('/api/admin/survey-questions')
  for (const q of items.value) {
    if (q.type === 'choice') {
      optionsText[q.question_key] = (q.options || []).join(', ')
    }
  }
  loading.value = false
})

const updateOptions = (q: SurveyQuestion) => {
  q.options = optionsText[q.question_key].split(',').map((s: string) => s.trim()).filter(Boolean)
}

const nextKey = () => {
  const keys = items.value.map((q) => {
    const n = parseInt(q.question_key.replace(/\D/g, ''))
    return isNaN(n) ? 0 : n
  })
  return `q${Math.max(0, ...keys) + 1}`
}

const addQuestion = () => {
  const key = nextKey()
  items.value.push({
    id: '',
    question_key: key,
    label: 'Pertanyaan baru',
    type: 'rating',
    options: [],
    sort_order: items.value.length + 1,
    is_active: true,
    created_at: '',
    updated_at: ''
  })
}

const deleteQuestion = async (index: number) => {
  const q = items.value[index]
  if (q.id) {
    try {
      await $fetch(`/api/admin/survey-questions/${q.question_key}`, { method: 'DELETE' })
    } catch {
      // Continue even if delete fails (question might not exist in DB yet)
    }
  }
  items.value.splice(index, 1)
}

const saveAll = async () => {
  saving.value = true
  message.value = ''
  try {
    const payload = items.value.map((q) => ({
      question_key: q.question_key,
      label: q.label,
      type: q.type,
      options: q.type === 'choice' ? q.options : [],
      sort_order: q.sort_order,
      is_active: q.is_active
    }))
    await $fetch('/api/admin/survey-questions', { method: 'PUT', body: { questions: payload } })
    tone.value = 'success'
    message.value = 'Semua pertanyaan berhasil disimpan.'
  } catch {
    tone.value = 'error'
    message.value = 'Pertanyaan belum berhasil disimpan. Periksa koneksi lalu coba lagi.'
  } finally {
    saving.value = false
  }
}
</script>
