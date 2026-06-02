<template>
  <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur no-print">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
      <NuxtLink to="/admin/dashboard" class="font-extrabold text-navy">Admin Dialog Kebangsaan</NuxtLink>
      <nav class="flex flex-wrap gap-2 text-sm font-bold text-slate-600">
        <NuxtLink class="rounded-full px-3 py-2 hover:bg-red-50 [&.router-link-active]:bg-red-50 [&.router-link-active]:text-red-700" to="/admin/dashboard">Dashboard</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 hover:bg-red-50 [&.router-link-active]:bg-red-50 [&.router-link-active]:text-red-700" to="/admin/participants">Peserta</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 hover:bg-red-50 [&.router-link-active]:bg-red-50 [&.router-link-active]:text-red-700" to="/admin/surveys">Survey</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 hover:bg-red-50 [&.router-link-active]:bg-red-50 [&.router-link-active]:text-red-700" to="/admin/survey-questions">Pertanyaan</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 hover:bg-red-50 [&.router-link-active]:bg-red-50 [&.router-link-active]:text-red-700" to="/admin/action-plans">Action Plan</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 hover:bg-red-50 [&.router-link-active]:bg-red-50 [&.router-link-active]:text-red-700" to="/admin/certificates">Sertifikat</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 hover:bg-red-50 [&.router-link-active]:bg-red-50 [&.router-link-active]:text-red-700" to="/admin/event-qr">QR Acara</NuxtLink>
        <button class="rounded-full px-3 py-2 text-red-700 hover:bg-red-50" @click="logout">Keluar</button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { logout } = useAdminSession()
</script>
