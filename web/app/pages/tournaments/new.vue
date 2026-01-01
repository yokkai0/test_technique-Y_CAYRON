<template>
    <div class="max-w-xl space-y-6">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">Créer un tournoi</h1>
        <p class="text-gray-600 text-sm">Nom, date, description. Ensuite tu ajoutes les équipes.</p>
      </div>
  
      <form class="bg-white border rounded-lg p-5 space-y-4" @submit.prevent="submit">
        <div class="space-y-1">
          <label class="text-sm font-medium">Nom</label>
          <input
            class="w-full border rounded px-3 py-2"
            v-model="name"
            placeholder="Ex: Tournoi du vendredi"
          />
        </div>
  
        <div class="space-y-1">
          <label class="text-sm font-medium">Date</label>
          <input class="w-full border rounded px-3 py-2" v-model="date" type="datetime-local" />
          <p class="text-xs text-gray-500">Choisis une date/heure (format local).</p>
        </div>
  
        <div class="space-y-1">
          <label class="text-sm font-medium">Description</label>
          <textarea
            class="w-full border rounded px-3 py-2 min-h-[90px]"
            v-model="description"
            placeholder="Optionnel"
          />
        </div>
  
        <div class="flex items-center gap-3">
          <button class="px-4 py-2 rounded bg-black text-white disabled:opacity-60" :disabled="loading">
            {{ loading ? "Création..." : "Créer" }}
          </button>
  
          <NuxtLink to="/" class="px-4 py-2 rounded border bg-white">Annuler</NuxtLink>
        </div>
  
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  const { $api } = useNuxtApp()
  const router = useRouter()
  
  const name = ref("")
  const date = ref("")
  const description = ref("")
  const loading = ref(false)
  const error = ref("")
  
  function toISO(dtLocal) {
    return new Date(dtLocal).toISOString()
  }
  
  async function submit() {
    error.value = ""
  
    if (!name.value.trim()) {
      error.value = "Le nom est obligatoire."
      return
    }
    if (!date.value) {
      error.value = "La date est obligatoire."
      return
    }
  
    loading.value = true
    try {
      const created = await $api("/tournaments", {
        method: "POST",
        body: {
          name: name.value.trim(),
          date: toISO(date.value),
          description: description.value.trim() || undefined,
        },
      })
  
      router.push(`/tournaments/${created.id}`)
    } catch (e) {
      error.value = e?.data?.message || "Erreur lors de la création."
    } finally {
      loading.value = false
    }
  }
  </script>
  