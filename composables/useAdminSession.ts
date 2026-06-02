export const useAdminSession = () => {
  const config = useRuntimeConfig()
  const adminCookie = useCookie('dialog-admin', { default: () => '', sameSite: 'lax', path: '/' })
  const isAdmin = computed(() => adminCookie.value === 'active')

  const login = (password: string) => {
    if (password.trim() !== String(config.public.adminPassword).trim()) return false
    adminCookie.value = 'active'
    return true
  }

  const logout = async () => {
    adminCookie.value = ''
    await navigateTo('/admin/login')
  }

  return { isAdmin, login, logout }
}
