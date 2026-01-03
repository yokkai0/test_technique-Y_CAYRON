<template>
  <div v-if="tournament" class="tournamentPage">
    <!-- Header -->
    <div class="tournamentHeaderCard">
      <NuxtLink to="/admin" class="backLink">← Retour</NuxtLink>

      <div class="tournamentHeaderTop">
        <div class="tournamentHeaderMeta">
          <h1 class="tournamentTitle">{{ tournament.name }}</h1>
          <div class="tournamentDate">
            <span class="tournamentDateDot" />
            {{ formatDate(tournament.date) }}
          </div>
        </div>

        <span class="tournamentBadge" aria-disabled="true">Tournoi</span>
      </div>

      <p v-if="tournament.description" class="tournamentDesc">
        {{ tournament.description }}
      </p>
    </div>

    <div class="grid2">
      <!-- Teams -->
      <section class="panel">
        <div class="panelHeader">
          <h2 class="panelTitle">Équipes</h2>
          <span class="panelCount">{{ tournament.teams?.length || 0 }}</span>
        </div>

        <div class="teamForm">
          <input
            class="input"
            v-model="teamName"
            placeholder="Nom d'équipe"
          />
          <button
            class="btnPrimary"
            :disabled="loadingTeam"
            @click="addTeam"
          >
            {{ loadingTeam ? "..." : "Ajouter" }}
          </button>
        </div>

        <p v-if="teamError" class="errorText">{{ teamError }}</p>

        <div v-if="!tournament.teams?.length" class="mutedText">
          Aucune équipe pour le moment.
        </div>

        <ul v-else class="teamList">
          <li v-for="tt in tournament.teams" :key="tt.teamId" class="teamItem">
            {{ tt.team.name }}
          </li>
        </ul>

        <!-- Generate matches -->
        <div class="genWrap">
          <button
            class="btnSecondary wFull"
            :disabled="loadingGen || (tournament.teams?.length || 0) < 2 || (tournament.matches?.length || 0) > 0"
            @click="generateMatches"
          >
            {{
              (tournament.matches?.length || 0) > 0
                ? "Matchs déjà générés"
                : loadingGen
                  ? "Génération..."
                  : "Générer les matchs (round-robin)"
            }}
          </button>
          <p v-if="matchError" class="errorText mt8">{{ matchError }}</p>
        </div>
      </section>

      <!-- Standings -->
      <section class="panel">
        <div class="panelHeader">
          <h2 class="panelTitle">Classement</h2>
          <button class="btnGhost" @click="refreshStandings">Rafraîchir</button>
        </div>

        <p v-if="standingsError" class="errorText">{{ standingsError }}</p>

        <div v-if="standingsPending" class="mutedText">Chargement...</div>

        <div v-else-if="!hasRealStandings()" class="mutedText">
          Aucun score enregistré pour le moment.
        </div>

        <div v-else class="standingsTableWrap">
          <table class="standingsTable">
            <thead>
              <tr>
                <th class="colRank">#</th>
                <th class="colTeam">Équipe</th>
                <th class="colPts">Pts</th>
                <th class="colSmall">Joués</th>
                <th class="colSmall">Vict</th>
                <th class="colSmall">Nul</th>
                <th class="colSmall">Def</th>
                <th class="colSmall">Diff</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in standings" :key="r.teamId">
                <td class="cellRank">{{ r.rank }}</td>
                <td class="cellTeam">{{ r.teamName }}</td>
                <td class="cellPts">{{ r.points }}</td>
                <td class="cellSmall">{{ r.played }}</td>
                <td class="cellSmall">{{ r.wins }}</td>
                <td class="cellSmall">{{ r.draws }}</td>
                <td class="cellSmall">{{ r.losses }}</td>
                <td class="cellSmall">{{ r.goalDiff }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Matchs -->
    <section class="panel matchesPanel">
      <div class="panelHeader">
        <h2 class="panelTitle">Matchs</h2>
        <span class="panelCount">{{ tournament.matches?.length || 0 }}</span>
      </div>

      <p v-if="matchError" class="errorText">{{ matchError }}</p>

      <div v-if="(tournament.matches?.length || 0) === 0" class="mutedText">
        Aucun match. Ajoutez des équipes puis cliquez sur “Générer les matchs”.
      </div>

      <div v-else class="matchesList">
        <div v-for="m in tournament.matches" :key="m.id" class="matchCard">
          <div class="matchTop">
            <div class="matchTitle">
              {{ m.homeTeam.name }}
              <span class="matchVs">vs</span>
              {{ m.awayTeam.name }}
            </div>

            <span class="matchStatus">
              {{ m.homeScore == null || m.awayScore == null ? "Non joué" : "Score enregistré" }}
            </span>
          </div>

          <div class="scoreRow">
            <input
              class="scoreInput"
              type="number"
              min="0"
              v-model.number="scores[m.id].home"
            />
            <span class="scoreDash">-</span>
            <input
              class="scoreInput"
              type="number"
              min="0"
              v-model.number="scores[m.id].away"
            />

            <button
              class="btnPrimary ml8"
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

  <div v-else class="pageLoading">
    <div class="loadingCard">
      <div class="loadingRow">
        <span class="loadingDot" />
        Chargement...
      </div>
    </div>
  </div>
</template>

<script setup>
  import "~/assets/css/tournament.css"

  definePageMeta({
    layout: "admin",
  })

  const { $api } = useNuxtApp()
  const route = useRoute()
  const tournamentId = route.params.id

  // tournoi
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

  // Scores + standings
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
        if (!scores[m.id]) {
          scores[m.id] = { home: m.homeScore ?? 0, away: m.awayScore ?? 0 }
        } else {
          // garde ce que l’utilisateur a tapé si déjà présent
          scores[m.id].home = scores[m.id].home ?? (m.homeScore ?? 0)
          scores[m.id].away = scores[m.id].away ?? (m.awayScore ?? 0)
        }
        saving[m.id] = false
      }
      refreshStandings()
    },
    { immediate: true }
  )

  function formatDate(dateLike) {
    try {
      return new Date(dateLike).toLocaleString()
    } catch {
      return ""
    }
  }

  function hasRealStandings() {
    if (!Array.isArray(standings.value) || standings.value.length === 0) return false
    // même logique que précédemment : on considère "présent" si au moins un match joué
    return standings.value.some((r) => (r?.played ?? 0) > 0)
  }

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
    } catch (e) {
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
