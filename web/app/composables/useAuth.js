export const useAuth = () => {
  const { $api } = useNuxtApp()

  const authenticated = useState("authenticated", () => false)

  async function refreshAuth() {
    try {
      const res = await $api("/auth/me")
      authenticated.value = !!res?.authenticated
    } catch {
      authenticated.value = false
    }
    return authenticated.value
  }

  async function logout() {
    await $api("/auth/logout", { method: "POST" }).catch(() => {})
    authenticated.value = false
  }

  return { authenticated, refreshAuth, logout }
}
  