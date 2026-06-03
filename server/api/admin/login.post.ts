export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'admin-login', 10, 60_000)
  const body = await readBody<{ password?: string }>(event)
  const config = useRuntimeConfig()

  if (String(body.password || '').trim() !== String(config.adminPassword).trim()) {
    throw createError({ statusCode: 401, statusMessage: 'Password admin salah.' })
  }

  createAdminSession(event)
  return { ok: true }
})
