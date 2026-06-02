export const eventQr = {
  checkin: 'DIALOG_KEBANGSAAN_CHECKIN_17_18_JUNI',
  survey: 'DIALOG_KEBANGSAAN_SURVEY_17_18_JUNI'
}

export const createEventCode = (type: keyof typeof eventQr) => `${Math.floor(1000 + Math.random() * 9000)}+${eventQr[type]}`

export const isValidEventCode = (value: string, type: keyof typeof eventQr) => {
  const decoded = decodeURIComponent(value || '')
  return /^\d{4}\+/.test(decoded) && decoded.endsWith(eventQr[type])
}
