<template>
  <header class="sticky top-0 z-20 border-b border-rose-100/80 bg-white/90 shadow-sm shadow-rose-100/40 backdrop-blur-xl no-print">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
      <NuxtLink to="/admin/dashboard" class="group inline-flex items-center gap-3 font-extrabold text-navy">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-700 to-rose-800 text-sm text-white shadow-lg shadow-rose-200 transition group-hover:-rotate-3">DK</span>
        <span>Admin Dialog Kebangsaan</span>
      </NuxtLink>
      <nav class="flex flex-wrap gap-2 text-sm font-bold text-slate-600">
        <NuxtLink class="rounded-full px-3 py-2 transition hover:bg-rose-50 hover:text-rose-800 [&.router-link-active]:bg-gradient-to-r [&.router-link-active]:from-red-700 [&.router-link-active]:to-rose-800 [&.router-link-active]:text-white [&.router-link-active]:shadow-md [&.router-link-active]:shadow-rose-200" to="/admin/dashboard">Dashboard</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 transition hover:bg-rose-50 hover:text-rose-800 [&.router-link-active]:bg-gradient-to-r [&.router-link-active]:from-red-700 [&.router-link-active]:to-rose-800 [&.router-link-active]:text-white [&.router-link-active]:shadow-md [&.router-link-active]:shadow-rose-200" to="/admin/participants">Peserta</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 transition hover:bg-rose-50 hover:text-rose-800 [&.router-link-active]:bg-gradient-to-r [&.router-link-active]:from-red-700 [&.router-link-active]:to-rose-800 [&.router-link-active]:text-white [&.router-link-active]:shadow-md [&.router-link-active]:shadow-rose-200" to="/admin/surveys">Survey</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 transition hover:bg-rose-50 hover:text-rose-800 [&.router-link-active]:bg-gradient-to-r [&.router-link-active]:from-red-700 [&.router-link-active]:to-rose-800 [&.router-link-active]:text-white [&.router-link-active]:shadow-md [&.router-link-active]:shadow-rose-200" to="/admin/survey-questions">Pertanyaan</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 transition hover:bg-rose-50 hover:text-rose-800 [&.router-link-active]:bg-gradient-to-r [&.router-link-active]:from-red-700 [&.router-link-active]:to-rose-800 [&.router-link-active]:text-white [&.router-link-active]:shadow-md [&.router-link-active]:shadow-rose-200" to="/admin/action-plans">Action Plan</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 transition hover:bg-rose-50 hover:text-rose-800 [&.router-link-active]:bg-gradient-to-r [&.router-link-active]:from-red-700 [&.router-link-active]:to-rose-800 [&.router-link-active]:text-white [&.router-link-active]:shadow-md [&.router-link-active]:shadow-rose-200" to="/admin/certificates">Sertifikat</NuxtLink>
        <NuxtLink class="rounded-full px-3 py-2 transition hover:bg-rose-50 hover:text-rose-800 [&.router-link-active]:bg-gradient-to-r [&.router-link-active]:from-red-700 [&.router-link-active]:to-rose-800 [&.router-link-active]:text-white [&.router-link-active]:shadow-md [&.router-link-active]:shadow-rose-200" to="/admin/event-qr">QR Acara</NuxtLink>
        <button class="rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-rose-800 transition hover:bg-rose-100" @click="logout">Keluar</button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { logout } = useAdminSession()
</script>
