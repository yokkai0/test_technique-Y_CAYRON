<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b bg-white">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="font-bold text-lg">
          BabyFoot Tournaments
        </NuxtLink>

        <div class="flex gap-2">
          <NuxtLink to="/" class="px-3 py-2 rounded hover:bg-gray-100">Tournois</NuxtLink>
          <NuxtLink to="/tournaments/new" class="px-3 py-2 rounded bg-black text-white">
            Nouveau
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8">
      <NuxtPage />
    </main>
  </div>
</template>
