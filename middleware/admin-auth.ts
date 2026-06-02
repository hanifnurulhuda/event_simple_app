export default defineNuxtRouteMiddleware(() => {
  const { isAdmin } = useAdminSession()
  if (!isAdmin.value) {
    return navigateTo('/admin/login')
  }
})
