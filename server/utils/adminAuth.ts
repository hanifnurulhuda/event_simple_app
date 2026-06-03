import { createHmac, timingSafeEqual } from 'node:crypto'

const SESSION_COOKIE = 'dialog-admin-session'
const FLAG_COOKIE = 'dialog-admin'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000

const signSession = (issuedAt: number, secret: string) => {
  return createHmac('sha256', secret).update(String(issuedAt)).digest('hex')
}

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export const createAdminSession = (event: Parameters<typeof setCookie>[0]) => {
  const config = useRuntimeConfig()
  const secret = String(config.adminPassword || '').trim()
  if (!secret) throw createError({ statusCode: 500, statusMessage: 'Admin password belum dikonfigurasi.' })

  const issuedAt = Date.now()
  const token = `${issuedAt}.${signSession(issuedAt, secret)}`

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000
  })
  setCookie(event, FLAG_COOKIE, 'active', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000
  })
}

export const clearAdminSession = (event: Parameters<typeof deleteCookie>[0]) => {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
  deleteCookie(event, FLAG_COOKIE, { path: '/' })
}

export const isAdminRequest = (event: Parameters<typeof getCookie>[0]) => {
  const config = useRuntimeConfig()
  const secret = String(config.adminPassword || '').trim()
  if (!secret) return false

  const token = getCookie(event, SESSION_COOKIE) || ''
  const [issuedAtText, signature] = token.split('.')
  const issuedAt = Number(issuedAtText)

  if (!issuedAt || !signature || Date.now() - issuedAt > SESSION_TTL_MS) return false
  return safeEqual(signature, signSession(issuedAt, secret))
}

export const requireAdmin = (event: Parameters<typeof getCookie>[0]) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Admin login required.' })
  }
}
