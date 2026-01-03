<template>
  <div class="app">
    <header class="header">
      <div class="header__inner">
        <NuxtLink to="/" class="brand">
          <span class="brand__mark" aria-hidden="true" />
          <div class="brand__text">
            <div class="brand__title">
              <span class="brand__title--baby">Baby</span
              ><span class="brand__title--rest">-Tournaments</span>
            </div>
            <div class="brand__subtitle">
              Suivez des tournois de baby-foot endiablés !
            </div>
          </div>
        </NuxtLink>

        <nav class="nav">
          <NuxtLink to="/login" class="btn btn--login">
            Connexion
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
  const { $api } = useNuxtApp()

  const { authenticated, refreshAuth } = useAuth()

  onMounted(() => {
    refreshAuth()
  })

  async function checkAuth() {
    try {
      const res = await $api("/auth/me")
      authenticated.value = !!res?.authenticated
    } catch {
      authenticated.value = false
    }
  }

  onMounted(checkAuth)
</script>

<style scoped>
  /* Layout */
  .app {
    min-height: 100vh;
    background: linear-gradient(to bottom, #000000, #1b1b22, #000000);
    color: #ffffff;
  }

  /* Header */
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(43, 10, 61, 0.92);
    border-bottom: 1px solid rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(10px);
  }

  .header__inner {
    max-width: 64rem;
    margin: 0 auto;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Brand */
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    text-decoration: none;
    color: inherit;
  }

  .brand__mark {
    height: 40px;
    width: 40px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6d28d9, #2b0a3d, #60a5fa);
    box-shadow: 0 0 30px rgba(96, 165, 250, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .brand__text {
    line-height: 1.1;
  }

  .brand__title {
    font-weight: 800;
    letter-spacing: -0.02em;
    font-size: 18px;
  }

  .brand__title--baby {
    color: #60a5fa;
  }

  .brand__title--rest {
    color: #ffffff;
  }

  .brand__subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
  }

  /* Nav */
  .nav {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: transform 120ms ease, opacity 120ms ease, box-shadow 120ms ease;
  }

  .btn:active {
    transform: translateY(1px);
  }

  /* Connexion */
  .btn--login {
    background: #ffffff;
    color: #2b0a3d;
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.25);
  }

  .btn--login:hover {
    opacity: 0.92;
  }

  /* Déconnexion */
  .btn--logout {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn--logout:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  /* Main */
  .main {
    max-width: 64rem;
    margin: 0 auto;
    padding: 40px 28px;
  }
</style>
