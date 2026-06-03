export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'admin-login', 10, 60_000)
  const body = await readBody<{ password?: string }>(event)
  const config = useRuntimeConfig()
  const adminPassword = String(config.adminPassword || '').trim()

  if (!adminPassword) {
    throw createError({ statusCode: 500, statusMessage: 'Admin password belum dikonfigurasi.' })
  }

  if (String(body.password || '').trim() !== adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Password admin salah.' })
  }

  createAdminSession(event)
  return { ok: true }
})
