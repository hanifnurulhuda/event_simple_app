export const useAdminSession = () => {
  const adminCookie = useCookie('dialog-admin', { default: () => '', sameSite: 'lax', path: '/' })
  const isAdmin = computed(() => adminCookie.value === 'active')

  const login = async (password: string) => {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password }
    })
    adminCookie.value = 'active'
  }

  const logout = async () => {
    await $fetch('/api/admin/logout', { method: 'POST' }).catch(() => null)
    adminCookie.value = ''
    await navigateTo('/admin/login')
  }

  return { isAdmin, login, logout }
}
