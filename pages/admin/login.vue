<template>
  <main class="app-shell grid min-h-screen place-items-center px-4">
    <form class="card w-full max-w-md" @submit.prevent="submit">
      <p class="text-sm font-bold uppercase tracking-wider text-red-700">Admin</p>
      <h1 class="mt-2 text-3xl font-extrabold text-navy">Masuk Dashboard</h1>
      <p class="mt-2 text-slate-600">Masukkan password admin untuk mengelola data peserta, survey, dan sertifikat.</p>
      <div class="mt-6"><label class="label">Password admin</label><input v-model="password" class="input" type="password" required /></div>
      <StatusMessage class="mt-4" :message="message" tone="error" />
      <button class="btn-primary mt-5 w-full">Masuk</button>
    </form>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-redirect' })

const { login } = useAdminSession()
const password = ref('')
const message = ref('')

const submit = async () => {
  if (!login(password.value)) {
    message.value = 'Password admin salah.'
    return
  }
  await navigateTo('/admin/dashboard')
}
</script>
