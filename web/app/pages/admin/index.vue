<template>
  <div class="tournamentsPage">
    <!-- Header -->
    <div class="tournamentsHeader">
      <div class="tournamentsHeaderText">
        <h1 class="tournamentsTitle">Tournois</h1>
        <p class="tournamentsSubtitle">
          Crée un tournoi, ajoute des équipes, génère les matchs et saisis les scores.
        </p>
      </div>

      <NuxtLink to="/admin/tournaments/new" class="createTournamentBtn">
        <span class="createTournamentBtnIcon">＋</span>
        Créer un tournoi
      </NuxtLink>
    </div>

    <!-- Content -->
    <div v-if="pending" class="loadingCard">
      <div class="loadingRow">
        <span class="loadingDot" />
        Chargement des tournois...
      </div>
    </div>

    <div v-else class="content">
      <!-- Empty state -->
      <div v-if="!tournaments?.length" class="emptyCard">
        <div class="emptyInner">
          <div class="emptyTitle">Aucun tournoi pour le moment</div>
          <p class="emptyText">
            Commence par créer ton premier tournoi. Tu pourras ensuite ajouter des équipes, générer les matchs automatiquement
            et suivre le classement.
          </p>

          <div class="emptyCta">
            <NuxtLink to="/admin/tournaments/new" class="createTournamentBtn">
              Créer mon premier tournoi
              <span class="emptyCtaArrow">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- List -->
      <div v-else class="tournamentsGrid">
        <NuxtLink
          v-for="t in tournaments"
          :key="t.id"
          :to="`/admin/tournaments/${t.id}`"
          class="tournamentCard"
        >
          <div class="tournamentTop">
            <div class="tournamentMeta">
              <div class="tournamentName">
                {{ t.name }}
              </div>

              <div class="tournamentDate">
                <span class="tournamentDateDot" />
                {{ new Date(t.date).toLocaleString() }}
              </div>
            </div>

            <span class="tournamentOpenBadge">
              Ouvrir
              <span class="tournamentOpenArrow">→</span>
            </span>
          </div>

          <p v-if="t.description" class="tournamentDesc">
            {{ t.description }}
          </p>

          <div class="tournamentDivider" />
          <div class="tournamentFooter">
            Gérer équipes · Générer matchs · Saisir scores · Voir classement
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>

  definePageMeta({
    layout: "admin",
  })

  const { $api } = useNuxtApp()

  const { data: tournaments, pending } = await useAsyncData("tournaments", () =>
    $api("/tournaments")
  )
</script>

<style scoped>
  /* Page layout */
  .tournamentsPage {
    max-width: 56rem; /* ~max-w-4xl */
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  @media (min-width: 1024px) {
    .tournamentsPage {
      padding: 0 2.5rem; /* ~lg:px-10 */
    }
  }

  /* Header */
  .tournamentsHeader {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  @media (min-width: 640px) {
    .tournamentsHeader {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }
  }

  .tournamentsHeaderText {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tournamentsTitle {
    font-size: 1.875rem; /* text-3xl */
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .tournamentsSubtitle {
    font-size: 0.875rem; /* text-sm */
    color: rgba(255, 255, 255, 0.6);
  }

  /* Create button (off-white bg + dark violet text + a bit more margin/padding) */
  .createTournamentBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    /* léger margin + padding */
    margin-top: 0.25rem;
    padding: 0.7rem 1.05rem;

    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease;

    background: rgba(250, 248, 255, 0.95); /* blanc cassé */
    color: #2b0a3d; /* violet foncé */
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 10px 30px rgba(109, 40, 217, 0.12);
  }

  @media (min-width: 640px) {
    .createTournamentBtn {
      margin-top: 0;
    }
  }

  .createTournamentBtn:hover {
    background: rgba(250, 248, 255, 1);
    box-shadow: 0 16px 40px rgba(109, 40, 217, 0.18);
    transform: translateY(-1px);
  }

  .createTournamentBtnIcon {
    font-size: 1.05rem;
    line-height: 1;
    transform: translateY(-0.5px);
  }

  /* Loading */
  .loadingCard {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
  }

  .loadingRow {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .loadingDot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 999px;
    background: #60a5fa;
    animation: pulse 1.2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.95);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Content */
  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Empty state */
  .emptyCard {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03));
    padding: 2.5rem;
  }

  .emptyInner {
    max-width: 36rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .emptyTitle {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .emptyText {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
  }

  .emptyCta {
    padding-top: 0.5rem;
  }

  .emptyCtaArrow {
    margin-left: 0.25rem;
    opacity: 0.85;
  }

  /* Grid/list */
  .tournamentsGrid {
    display: grid;
    gap: 1rem;
  }

  /* Tournament card (padding ajouté) */
  .tournamentCard {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03));
    padding: 1.25rem; /* padding sur les éléments */
    text-decoration: none;
    transition: border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
  }

  @media (min-width: 640px) {
    .tournamentCard {
      padding: 1.5rem; /* un peu plus sur sm+ */
    }
  }

  .tournamentCard:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    transform: translateY(-1px);
  }

  /* Top row */
  .tournamentTop {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .tournamentMeta {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  /* Text stylisation: titre / date / etc */
  .tournamentName {
    font-size: 1.55rem;
    font-weight: 800;
    letter-spacing: -0.015em;
    color: rgba(255, 255, 255, 0.62);
  }

  @media (min-width: 640px) {
    .tournamentName {
      font-size: 1.25rem;
    }
  }

  .tournamentDate {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.62);
  }

  .tournamentDateDot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: rgba(96, 165, 250, 0.8);
  }

  /* Open badge */
  .tournamentOpenBadge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.75rem;
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;

    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.82);

    transition: border-color 160ms ease, color 160ms ease;
  }

  .tournamentCard:hover .tournamentOpenBadge {
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
  }

  .tournamentOpenArrow {
    color: rgba(255, 255, 255, 0.6);
    transition: color 160ms ease;
  }

  .tournamentCard:hover .tournamentOpenArrow {
    color: rgba(255, 255, 255, 0.85);
  }

  /* Description */
  .tournamentDesc {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.62);
    line-height: 1.65;
  }

  /* Divider + footer */
  .tournamentDivider {
    margin-top: 1.25rem;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
  }

  .tournamentFooter {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
