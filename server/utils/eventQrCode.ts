type EventQrType = 'checkin' | 'survey'
type EventQrValue = { code: string; created_at: string }

const eventQrCache: Record<string, { value: EventQrValue; expires: number } | undefined> = {}
const eventQrInflight: Record<string, Promise<EventQrValue> | undefined> = {}

export const getCurrentEventQrCode = async (type: EventQrType) => {
  const cached = eventQrCache[type]
  if (cached && cached.expires > Date.now()) return cached.value

  if (eventQrInflight[type]) return await eventQrInflight[type]

  eventQrInflight[type] = loadCurrentEventQrCode(type).finally(() => {
    eventQrInflight[type] = undefined
  })

  return await eventQrInflight[type]
}

export const getCurrentEventCode = async (type: EventQrType) => {
  const value = await getCurrentEventQrCode(type)
  return value.code
}

export const clearEventQrCodeCache = (type?: EventQrType) => {
  if (type) {
    eventQrCache[type] = undefined
    eventQrInflight[type] = undefined
    return
  }
  eventQrCache.checkin = undefined
  eventQrCache.survey = undefined
  eventQrInflight.checkin = undefined
  eventQrInflight.survey = undefined
}

const loadCurrentEventQrCode = async (type: EventQrType) => {
  const db = useDb()
  const result = await db.query('select code, created_at from event_qr_codes where type = $1', [type])
  const value = result.rows[0] as EventQrValue | undefined
  if (!value?.code) throw createError({ statusCode: 404, statusMessage: 'QR acara belum digenerate.' })

  eventQrCache[type] = { value, expires: Date.now() + 3000 }
  return value
}

export const assertEventCode = async (type: EventQrType, eventCode: unknown) => {
  const currentCode = await getCurrentEventCode(type)
  if (String(eventCode || '') !== currentCode) {
    throw createError({ statusCode: 403, statusMessage: 'QR acara tidak valid.' })
  }
}
