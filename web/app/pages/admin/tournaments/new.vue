<template>
  <div class="createPage">
    <div class="createHeader">
      <h1 class="createTitle">Créer un tournoi</h1>
      <p class="createSubtitle">Nom, date, description. L'ajout des équipes se fait après.</p>
    </div>

    <form class="createCard" @submit.prevent="submit">
      <div class="field">
        <label class="label">Nom</label>
        <input
          class="input"
          v-model="name"
          placeholder="Ex: Tournoi du vendredi"
        />
      </div>

      <div class="field">
        <label class="label">Date</label>
        <input class="input" v-model="date" type="datetime-local" />
      </div>

      <div class="field">
        <label class="label">Description</label>
        <textarea
          class="textarea"
          v-model="description"
          placeholder="Optionnel"
        />
      </div>

      <div class="actions">
        <button class="btnPrimary" :disabled="loading">
          {{ loading ? "Création..." : "Créer" }}
        </button>

        <NuxtLink to="/admin/tournaments" class="btnSecondary">
          Annuler
        </NuxtLink>
      </div>

      <p v-if="error" class="errorText">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
  import "~/assets/css/new.css"

  definePageMeta({
    layout: "admin",
  })

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

      router.push(`/admin/tournaments/${created.id}`)
    } catch (e) {
      error.value = e?.data?.message || "Erreur lors de la création."
    } finally {
      loading.value = false
    }
  }
</script>
