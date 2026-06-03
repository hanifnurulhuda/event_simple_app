const eventQrCache: Record<string, { code: string; expires: number } | undefined> = {}
const eventQrInflight: Record<string, Promise<string> | undefined> = {}

export const getCurrentEventCode = async (type: 'checkin' | 'survey') => {
  const cached = eventQrCache[type]
  if (cached && cached.expires > Date.now()) return cached.code

  if (eventQrInflight[type]) return await eventQrInflight[type]

  eventQrInflight[type] = loadCurrentEventCode(type).finally(() => {
    eventQrInflight[type] = undefined
  })

  return await eventQrInflight[type]
}

const loadCurrentEventCode = async (type: 'checkin' | 'survey') => {
  const db = useDb()
  const result = await db.query('select code from event_qr_codes where type = $1', [type])
  const code = result.rows[0]?.code
  if (!code) throw createError({ statusCode: 404, statusMessage: 'QR acara belum digenerate.' })

  eventQrCache[type] = { code, expires: Date.now() + 3000 }
  return code
}

export const assertEventCode = async (type: 'checkin' | 'survey', eventCode: unknown) => {
  const currentCode = await getCurrentEventCode(type)
  if (String(eventCode || '') !== currentCode) {
    throw createError({ statusCode: 403, statusMessage: 'QR acara tidak valid.' })
  }
}
