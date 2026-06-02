<template>
  <header class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
    <NuxtLink to="/" class="flex items-center gap-3 font-extrabold text-navy">
      <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-700 text-white">DK</span>
      <span>Dialog Kebangsaan</span>
    </NuxtLink>
    <nav class="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
      <NuxtLink class="rounded-full px-3 py-2 hover:bg-white [&.router-link-active]:bg-white [&.router-link-active]:text-red-700" to="/register">Daftar</NuxtLink>
      <NuxtLink class="rounded-full px-3 py-2 hover:bg-white [&.router-link-active]:bg-white [&.router-link-active]:text-red-700" to="/checkin">Check-in</NuxtLink>
      <NuxtLink class="rounded-full px-3 py-2 hover:bg-white [&.router-link-active]:bg-white [&.router-link-active]:text-red-700" to="/survey">Survey</NuxtLink>
      <NuxtLink class="rounded-full px-3 py-2 hover:bg-white [&.router-link-active]:bg-white [&.router-link-active]:text-red-700" to="/certificate">Sertifikat</NuxtLink>
      <NuxtLink class="rounded-full px-3 py-2 hover:bg-white [&.router-link-active]:bg-white [&.router-link-active]:text-red-700" to="/action-plan">Action Plan</NuxtLink>
    </nav>
  </header>
</template>
