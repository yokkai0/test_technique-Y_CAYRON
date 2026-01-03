<template>
  <div class="tournamentsPage">
    <!-- Header -->
    <div class="tournamentsHeader">
      <div class="tournamentsHeaderText">
        <h1 class="tournamentsTitle">Tournois</h1>
        <p class="tournamentsSubtitle">
          Suis tous les classements des derniers tournois de baby-foot !
        </p>
      </div>

    </div>

    <!-- Content -->
    <div v-if="pending" class="loadingCard">
      <div class="loadingRow">
        <span class="loadingDot" />
        Chargement des tournois...
      </div>
    </div>

    <div v-else class="content">
      <!-- Empty -->
      <div v-if="!tournaments?.length" class="emptyCard">
        <div class="emptyInner">
          <div class="emptyTitle">Aucun tournoi pour le moment</div>
        </div>
      </div>

      <!-- List -->
      <div v-else class="tournamentsGrid">
        <div v-for="t in tournaments" :key="t.id" class="tournamentCard">
          <div class="tournamentTop">
            <div class="tournamentMeta">
              <div class="tournamentName">
                {{ t.name }}
              </div>

              <div class="tournamentDate">
                <span class="tournamentDateDot" />
                {{ formatDate(t.date) }}
              </div>
            </div>

            <span class="tournamentOpenBadge" aria-disabled="true">
              Tournoi
            </span>
          </div>

          <p v-if="t.description" class="tournamentDesc">
            {{ t.description }}
          </p>

          <div class="tournamentDivider" />

          <!-- CONTENU DYNAMIQUE -->
          <div class="tournamentBody">
            <!-- 1) Tournoi pas encore commencé => compte à rebours -->
            <div v-if="!isStarted(t.date)" class="countdownWrap">
              <div class="countdownTitle">Début dans</div>
              <div class="countdown">
                <div class="countdownItem">
                  <div class="countdownValue">{{ countdown(t.date).days }}</div>
                  <div class="countdownLabel">Jours</div>
                </div>
                <div class="countdownItem">
                  <div class="countdownValue">{{ countdown(t.date).hours }}</div>
                  <div class="countdownLabel">Heures</div>
                </div>
                <div class="countdownItem">
                  <div class="countdownValue">{{ countdown(t.date).minutes }}</div>
                  <div class="countdownLabel">Min</div>
                </div>
                <div class="countdownItem">
                  <div class="countdownValue">{{ countdown(t.date).seconds }}</div>
                  <div class="countdownLabel">Sec</div>
                </div>
              </div>
            </div>

            <!-- 2) Tournoi commencé => on affiche le classement -->
            <template v-else>
              <div v-if="standingsLoading[t.id]" class="miniLoading">
                <span class="miniDot" />
                Récupération du classement...
              </div>

              <div v-else-if="!hasRealStandings(t.id)" class="inProgressPill">
                Tournoi en cours
              </div>

              <!-- 3) Classement présent -->
              <div v-else class="standingsWrap">
                <div class="standingsHeader">
                  <div class="standingsTitle">Classement</div>
                  <div class="standingsHint">Mis à jour automatiquement (selon les scores saisis)</div>
                </div>

                <div class="standingsTableWrap">
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
                        <th class="colSmall">Buts ></th>
                        <th class="colSmall">Buts <</th>
                        <th class="colSmall">Diff</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="row in standingsByTournament[t.id]" :key="row.teamId">
                        <td class="cellRank">{{ row.rank }}</td>
                        <td class="cellTeam">{{ row.teamName }}</td>
                        <td class="cellPts">{{ row.points }}</td>
                        <td class="cellSmall">{{ row.played }}</td>
                        <td class="cellSmall">{{ row.wins }}</td>
                        <td class="cellSmall">{{ row.draws }}</td>
                        <td class="cellSmall">{{ row.losses }}</td>
                        <td class="cellSmall">{{ row.goalsFor }}</td>
                        <td class="cellSmall">{{ row.goalsAgainst }}</td>
                        <td class="cellSmall">{{ row.goalDiff }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
    
  import "~/assets/css/index.css"

  const { $api } = useNuxtApp()

  const { data: tournaments, pending } = await useAsyncData("tournaments", () =>
    $api("/tournaments")
  )

  /** ticking "now" for countdowns */
  const now = ref(Date.now())
  let timer = null
  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  /** Standings storage */
  const standingsByTournament = reactive({})
  const standingsLoading = reactive({})

  function isStarted(dateLike) {
    const t = new Date(dateLike).getTime()
    return t <= now.value
  }

  function formatDate(dateLike) {
    try {
      return new Date(dateLike).toLocaleString()
    } catch {
      return ""
    }
  }

  function pad2(n) {
    return String(n).padStart(2, "0")
  }

  function countdown(dateLike) {
    const target = new Date(dateLike).getTime()
    const diff = Math.max(0, target - now.value)

    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
      days,
      hours: pad2(hours),
      minutes: pad2(minutes),
      seconds: pad2(seconds),
    }
  }

  /**
   * "Classement présent" = on a des lignes ET au moins un match joué (played > 0)
   * (Sinon, ton endpoint renvoie souvent une table à 0 même sans scores)
   */
  function hasRealStandings(tournamentId) {
    const rows = standingsByTournament[tournamentId]
    if (!Array.isArray(rows) || rows.length === 0) return false
    return rows.some((r) => (r?.played ?? 0) > 0)
  }

  async function fetchStandingsIfNeeded(tournamentId) {
    if (standingsByTournament[tournamentId] || standingsLoading[tournamentId]) return

    standingsLoading[tournamentId] = true
    try {
      const rows = await $api(`/tournaments/${tournamentId}/standings`)
      standingsByTournament[tournamentId] = Array.isArray(rows) ? rows : []
    } catch {
      standingsByTournament[tournamentId] = []
    } finally {
      standingsLoading[tournamentId] = false
    }
  }

  /** Whenever tournaments change, fetch standings for those that already started */
  watch(
    tournaments,
    (list) => {
      if (!Array.isArray(list)) return
      for (const t of list) {
        if (t?.id && isStarted(t.date)) fetchStandingsIfNeeded(t.id)
      }
    },
    { immediate: true }
  )
</script>
