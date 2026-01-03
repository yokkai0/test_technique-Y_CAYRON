<template>
  <div class="login">
    <div class="login__card">
      <!-- Header -->
      <div class="login__header">
        <h1 class="login__title">Connexion administrateur</h1>
        <p class="login__subtitle">
          <span class="login__hint">Identifiants pour le test : admin / admin</span>
        </p>
      </div>

      <!-- Form -->
      <form class="login__form" @submit.prevent="login">
        <div class="field">
          <label class="field__label">Nom d’utilisateur</label>
          <input
            v-model="username"
            class="field__input"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label class="field__label">Mot de passe</label>
          <input
            type="password"
            v-model="password"
            class="field__input"
            autocomplete="current-password"
          />
        </div>

        <button class="login__button" :disabled="loading">
          {{ loading ? "Connexion en cours..." : "Se connecter" }}
        </button>

        <p v-if="error" class="login__error">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>
  
<script setup>
  const { $api } = useNuxtApp()
  const router = useRouter()
  
  const username = ref("admin")
  const password = ref("admin")
  const loading = ref(false)
  const error = ref("")
  
  
  async function login() {
    error.value = ""
    loading.value = true

    try {
        await $api("/auth/login", {
          method: "POST",
          body: { username: username.value, password: password.value },
        })

        await router.push("/admin")
      } catch (e) {
        error.value = e?.data?.message || "Identifiants incorrects"
      } finally {
        loading.value = false
      }
  }
</script>
  
<style scoped>
  /* Layout */
  .login {
    min-height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }
  
  /* Card */
  .login__card {
    width: 100%;
    max-width: 420px;
    padding: 36px 32px 40px;
    border-radius: 20px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.02)
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  }
  
  /* Header */
  .login__header {
    margin-bottom: 28px;
  }
  
  .login__title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  
  .login__subtitle {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.65);
  }
  
  .login__hint {
    font-size: 12px;
    color: rgba(96, 165, 250, 0.85);
  }
  
  /* Form */
  .login__form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .field__label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
  }
  
  .field__input {
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 14px;
    color: white;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.12);
    outline: none;
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }
  
  .field__input:focus {
    border-color: rgba(96, 165, 250, 0.7);
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.25);
  }
  
  /* Button */
  .login__button {
    margin-top: 10px;
    padding: 14px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    color: #2b0a3d;
    background: #ffffff;
    transition: transform 120ms ease, opacity 120ms ease, box-shadow 120ms ease;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
  }
  
  .login__button:hover:not(:disabled) {
    opacity: 0.95;
  }
  
  .login__button:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  .login__button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Error */
  .login__error {
    margin-top: 6px;
    font-size: 13px;
    color: #f87171;
  }
</style>
  