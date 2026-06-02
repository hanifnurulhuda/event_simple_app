import type { Participant } from '~/types/database'

export const normalizeWhatsapp = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}

export const createParticipantCode = () => `DK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

export const createQrToken = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  return `qr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

export const findParticipant = async (identifier: string) => {
  const trimmed = identifier.trim()
  const whatsapp = normalizeWhatsapp(trimmed)
  return await $fetch<Participant | null>('/api/participants/find', {
    query: { identifier: trimmed, whatsapp }
  })
}

export const certificateStatusFor = (participant: Pick<Participant, 'attended' | 'survey_submitted' | 'certificate_status'>) => {
  if (!participant.attended || !participant.survey_submitted) return 'not_eligible'
  if (participant.certificate_status === 'viewed') return 'viewed'
  return 'eligible'
}

export const certificateLabel = (status: string) => ({
  not_eligible: 'Tidak eligible',
  eligible: 'Eligible',
  viewed: 'Sudah dibuka'
})[status] || status
