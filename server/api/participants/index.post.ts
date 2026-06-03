import { randomUUID } from 'node:crypto'

const normalizeWhatsappServer = (value: unknown) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}

const createParticipantCodeServer = () => `DK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'public-register', 20, 60_000)
  const body = await readBody(event)
  const name = String(body.name || '').trim()
  const school = String(body.school || '').trim()
  const className = String(body.class_name || '').trim()
  const whatsapp = normalizeWhatsappServer(body.whatsapp)
  const eventDay = String(body.event_day || '').trim()

  if (!name || !school || !className || !whatsapp || !['17 Juni', '18 Juni'].includes(eventDay)) {
    throw createError({ statusCode: 400, statusMessage: 'Data pendaftaran tidak valid.' })
  }
  if (name.length > 120 || school.length > 160 || className.length > 80 || whatsapp.length < 10 || whatsapp.length > 16) {
    throw createError({ statusCode: 400, statusMessage: 'Data pendaftaran tidak valid.' })
  }

  const db = useDb()
  const result = await db.query(
    `insert into participants (participant_code, qr_token, name, school, class_name, whatsapp, event_day)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (whatsapp) do update set whatsapp = excluded.whatsapp
     returning participant_code`,
    [createParticipantCodeServer(), randomUUID(), name, school, className, whatsapp, eventDay]
  )

  return result.rows[0]
})
