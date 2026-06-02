<template>
  <div v-if="message" :class="['rounded-2xl border px-4 py-3 text-sm font-semibold', toneClass]">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ message: string, tone?: 'success' | 'error' | 'info' }>()

const toneClass = computed(() => {
  if (props.tone === 'error') return 'border-red-200 bg-red-50 text-red-800'
  if (props.tone === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return 'border-blue-200 bg-blue-50 text-blue-800'
})
</script>
