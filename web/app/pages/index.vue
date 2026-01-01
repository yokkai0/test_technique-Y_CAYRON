<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Tournois</h1>

      <NuxtLink class="px-3 py-2 rounded bg-black text-white" to="/tournaments/new">
        Créer
      </NuxtLink>
    </div>

    <div v-if="pending">Chargement...</div>

    <div v-else class="space-y-3">
      <div v-if="!tournaments?.length" class="text-gray-600">
        Aucun tournoi pour le moment.
      </div>

      <NuxtLink
        v-for="t in tournaments"
        :key="t.id"
        :to="`/tournaments/${t.id}`"
        class="block p-4 rounded border hover:bg-gray-50"
      >
        <div class="font-semibold">{{ t.name }}</div>
        <div class="text-sm text-gray-600">{{ new Date(t.date).toLocaleString() }}</div>
        <div class="text-sm mt-2" v-if="t.description">{{ t.description }}</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()

const { data: tournaments, pending } = await useAsyncData("tournaments", () =>
  $api("/tournaments")
)
</script>
