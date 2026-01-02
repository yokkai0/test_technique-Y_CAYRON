export default defineNuxtRouteMiddleware(async (to) => {
    console.log('middleware')
    if (!to.path.startsWith("/admin")) return
    
    const { $api } = useNuxtApp()
    const me = await $api("/auth/me").catch(() => ({ authenticated: false }))
  
    if (!me?.authenticated) {
        return navigateTo("/login")
    }
})
  