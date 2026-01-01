<template>
    <div class="space-y-6" v-if="tournament">
      <div class="bg-white border rounded-lg p-5 space-y-1">
        <NuxtLink to="/" class="text-sm underline text-gray-600">← Retour</NuxtLink>
        <h1 class="text-2xl font-bold">{{ tournament.name }}</h1>
        <div class="text-sm text-gray-600">
          {{ new Date(tournament.date).toLocaleString() }}
        </div>
        <p v-if="tournament.description" class="mt-2">{{ tournament.description }}</p>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Teams -->
        <section class="bg-white border rounded-lg p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-lg">Équipes</h2>
            <span class="text-sm text-gray-600">{{ tournament.teams?.length || 0 }}</span>
          </div>

          <div class="flex gap-2">
            <input
              class="flex-1 border rounded px-3 py-2"
              v-model="teamName"
              placeholder="Nom d'équipe"
            />
            <button
              class="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
              :disabled="loadingTeam"
              @click="addTeam"
            >
              Ajouter
            </button>
          </div>

          <p v-if="teamError" class="text-sm text-red-600">{{ teamError }}</p>

          <div v-if="!tournament.teams?.length" class="text-sm text-gray-600">
            Aucune équipe pour le moment.
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="tt in tournament.teams"
              :key="tt.teamId"
              class="border rounded px-3 py-2"
            >
              {{ tt.team.name }}
            </li>
          </ul>
        </section>
      <!-- Generation des matchs -->
        <div class="pt-2">
          <button
            class="w-full px-4 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-60"
            :disabled="loadingGen || (tournament.teams?.length || 0) < 2 || (tournament.matches?.length || 0) > 0"
            @click="generateMatches"
          >
            {{ (tournament.matches?.length || 0) > 0 ? "Matchs déjà générés" : "Générer les matchs (round-robin)" }}
          </button>
          <p v-if="matchError" class="text-sm text-red-600 mt-2">{{ matchError }}</p>
        </div>
  
        <section class="bg-white border rounded-lg p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-lg">Classement</h2>
            <button class="px-3 py-2 rounded border hover:bg-gray-50" @click="refreshStandings">
              Rafraîchir
            </button>
          </div>

          <p v-if="standingsError" class="text-sm text-red-600">{{ standingsError }}</p>

          <div v-if="standingsPending" class="text-sm text-gray-600">Chargement...</div>

          <div v-else-if="!standings.length" class="text-sm text-gray-600">
            Aucun score enregistré pour le moment.
          </div>

          <div v-else class="overflow-auto">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-2 pr-2">#</th>
                  <th class="text-left pr-2">Équipe</th>
                  <th class="text-right pr-2">Pts</th>
                  <th class="text-right pr-2">J</th>
                  <th class="text-right pr-2">V</th>
                  <th class="text-right pr-2">N</th>
                  <th class="text-right pr-2">D</th>
                  <th class="text-right">Diff</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in standings" :key="r.teamId" class="border-b">
                  <td class="py-2 pr-2">{{ r.rank }}</td>
                  <td class="pr-2 font-medium">{{ r.teamName }}</td>
                  <td class="text-right pr-2 font-semibold">{{ r.points }}</td>
                  <td class="text-right pr-2">{{ r.played }}</td>
                  <td class="text-right pr-2">{{ r.wins }}</td>
                  <td class="text-right pr-2">{{ r.draws }}</td>
                  <td class="text-right pr-2">{{ r.losses }}</td>
                  <td class="text-right">{{ r.goalDiff }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
  
      <!-- Matchs -->
      <section class="bg-white border rounded-lg p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-lg">Matchs</h2>
          <span class="text-sm text-gray-600">{{ tournament.matches.length }}</span>
        </div>
  
        <p v-if="matchError" class="text-sm text-red-600">{{ matchError }}</p>
  
        <div v-if="tournament.matches.length === 0" class="text-sm text-gray-600">
          Aucun match. Ajoute des équipes puis clique sur “Générer les matchs”.
        </div>
  
        <div v-else class="space-y-3">
          <div v-for="m in tournament.matches" :key="m.id" class="border rounded p-4 space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div class="font-medium">
                {{ m.homeTeam.name }} <span class="text-gray-500">vs</span> {{ m.awayTeam.name }}
              </div>
              <span class="text-xs text-gray-500">
                {{ m.homeScore == null || m.awayScore == null ? "Non joué" : "Score enregistré" }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <input
                class="w-20 border rounded px-3 py-2"
                type="number"
                min="0"
                v-model.number="scores[m.id].home"
              />
              <span>-</span>
              <input
                class="w-20 border rounded px-3 py-2"
                type="number"
                min="0"
                v-model.number="scores[m.id].away"
              />

              <button
                class="ml-2 px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-60"
                :disabled="saving[m.id]"
                @click="saveScore(m.id)"
              >
                {{ saving[m.id] ? "..." : "Enregistrer" }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  
    <div v-else class="text-sm text-gray-600">Chargement...</div>
  </template>
  
  <script setup>
  const { $api } = useNuxtApp()
  const route = useRoute()
  const tournamentId = route.params.id
  
  
  // tournois
  const { data: tournament, refresh } = await useAsyncData(`tournament-${tournamentId}`, () =>
  $api(`/tournaments/${tournamentId}`)
)
  
  // Teams 
  const teamName = ref("")
  const loadingTeam = ref(false)
  const teamError = ref("")

  async function addTeam() {
    teamError.value = ""
    const name = teamName.value.trim()
    if (!name) return

    loadingTeam.value = true
    try {
      await $api(`/tournaments/${tournamentId}/teams`, {
        method: "POST",
        body: { name },
      })
      teamName.value = ""
      await refresh()
    } catch (e) {
      teamError.value = e?.data?.message || "Erreur lors de l'ajout."
    } finally {
      loadingTeam.value = false
    }
  }
  
  // Matchs
  const loadingGen = ref(false)
  const matchError = ref("")
  
  // Scores 
  const scores = reactive({})
  const saving = reactive({})
  const standings = ref([])
  const standingsPending = ref(false)
  const standingsError = ref("")

  watch(
    () => tournament.value,
    (t) => {
      if (!t) return
      for (const m of t.matches || []) {
        scores[m.id] = {
          home: m.homeScore ?? 0,
          away: m.awayScore ?? 0,
        }
        saving[m.id] = false
      }
      refreshStandings()
    },
    { immediate: true }
  )

  async function saveScore(matchId) {
    matchError.value = ""
    saving[matchId] = true
    try {
      await $api(`/matches/${matchId}/score`, {
        method: "PATCH",
        body: {
          homeScore: scores[matchId].home,
          awayScore: scores[matchId].away,
        },
      })
      await refresh()
      await refreshStandings()
    } catch (e) {
      matchError.value = e?.data?.message || "Erreur lors de l'enregistrement."
    } finally {
      saving[matchId] = false
    }
  }

  async function refreshStandings() {
    standingsError.value = ""
    standingsPending.value = true
    try {
      standings.value = await $api(`/tournaments/${tournamentId}/standings`)
      console.log('standings.value: ', standings.value)
    } catch (e) {
      console.log('e: ', e)
      standings.value = []
      standingsError.value = e?.data?.message || ""
    } finally {
      standingsPending.value = false
    }
  }
  
  async function generateMatches() {
    matchError.value = ""
    loadingGen.value = true
    try {
      await $api(`/tournaments/${tournamentId}/matches/generate`, { method: "POST" })
      await refresh()
      await refreshStandings()
    } catch (e) {
      matchError.value = e?.data?.message || "Erreur lors de la génération."
    } finally {
      loadingGen.value = false
    }
  }
  
</script>
  